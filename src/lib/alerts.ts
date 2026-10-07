import "server-only";
import { and, desc, eq, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { syncRuns, syncState } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

/**
 * Surveillance du site : après chaque synchronisation planifiée (toutes les
 * heures en journée), on vérifie la base, Opisto et les pages clés. En cas de
 * problème, un e-mail part vers ALERT_EMAIL (adresses séparées par des
 * virgules), puis un rappel toutes les 3 heures, et un message « rétabli »
 * quand tout refonctionne.
 */
export type HealthProblem = { what: string; detail: string };

const STATE_KEY = "alert.open";
const REMINDER_MS = 3 * 3600 * 1000;
/** Au-delà, l'absence de synchro réussie est anormale (le plus long trou prévu est de 5 h, la nuit). */
const SYNC_GAP_MS = 6 * 3600 * 1000;
/** Pages vérifiées : accueil (cache), catalogue (rendu à chaque visite, lit la base) et recherche. */
const PAGES = ["/", "/pieces-auto", "/api/search?q=moteur"];

type OpenAlert = { since: string; lastSentAt: string };

function recipients(): string[] {
  return (process.env.ALERT_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const parisTime = (d: Date) => d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" });

function duration(ms: number): string {
  const min = Math.round(ms / 60000);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

/** Vérifie que les pages clés répondent. */
export async function checkPages(): Promise<HealthProblem[]> {
  const problems: HealthProblem[] = [];
  await Promise.all(
    PAGES.map(async (path) => {
      try {
        const res = await fetch(`${site.url}${path}`, { cache: "no-store", signal: AbortSignal.timeout(20_000), headers: { "user-agent": "cazenave-surveillance" } });
        if (!res.ok) problems.push({ what: `Page ${path}`, detail: `erreur HTTP ${res.status}` });
      } catch (err) {
        problems.push({ what: `Page ${path}`, detail: err instanceof Error ? err.message : String(err) });
      }
    }),
  );
  return problems;
}

/** État de l'alerte en cours (null si aucune, ou si la base est inaccessible). */
async function readOpenAlert(): Promise<OpenAlert | null> {
  try {
    const db = await getDb();
    const [row] = await db.select({ value: syncState.value }).from(syncState).where(eq(syncState.key, STATE_KEY)).limit(1);
    return row ? (JSON.parse(row.value) as OpenAlert) : null;
  } catch {
    return null;
  }
}

async function writeOpenAlert(value: OpenAlert | null) {
  try {
    const db = await getDb();
    if (!value) await db.delete(syncState).where(eq(syncState.key, STATE_KEY));
    else
      await db
        .insert(syncState)
        .values({ key: STATE_KEY, value: JSON.stringify(value), updatedAt: new Date() })
        .onConflictDoUpdate({ target: syncState.key, set: { value: JSON.stringify(value), updatedAt: new Date() } });
  } catch {
    // base inaccessible : l'alerte part quand même, sans mémoire des envois précédents
  }
}

/** Dernière synchro réussie avant celle en cours (pour repérer une panne qui n'a pas pu être enregistrée). */
async function previousSuccessAt(currentRunId: number | null): Promise<Date | null> {
  try {
    const db = await getDb();
    const where = currentRunId ? and(eq(syncRuns.status, "done"), lt(syncRuns.id, currentRunId)) : eq(syncRuns.status, "done");
    const [row] = await db.select({ at: syncRuns.finishedAt }).from(syncRuns).where(where).orderBy(desc(syncRuns.id)).limit(1);
    return row?.at ?? null;
  } catch {
    return null;
  }
}

async function notify(subject: string, lines: string[]) {
  const to = recipients();
  if (!to.length) {
    console.warn(`[surveillance] ALERT_EMAIL absente, alerte non envoyée : ${subject}\n${lines.join("\n")}`);
    return;
  }
  await sendEmail({ to, subject, text: lines.join("\n") });
}

/** E-mail de test, pour vérifier la réception (et l'absence de classement en indésirables). */
export async function sendTestAlert(): Promise<{ sentTo: string[] }> {
  const to = recipients();
  await notify(`🔔 ${site.name} : test de la surveillance`, [
    `Ceci est un message de test envoyé le ${parisTime(new Date())}.`,
    "Les alertes de la surveillance automatique du site arriveront à cette adresse.",
  ]);
  return { sentTo: to };
}

/**
 * Envoie l'alerte (ou le rappel) s'il y a des problèmes, sinon le message
 * « rétabli » si une alerte était en cours. Ne lève jamais d'erreur.
 */
export async function reportHealth(problems: HealthProblem[], context: { runId?: number | null } = {}) {
  try {
    const now = new Date();
    const open = await readOpenAlert();

    if (problems.length) {
      if (open && now.getTime() - new Date(open.lastSentAt).getTime() < REMINDER_MS) return;
      const since = open ? new Date(open.since) : now;
      await notify(open ? `⚠️ ${site.name} : problème toujours en cours (depuis ${duration(now.getTime() - since.getTime())})` : `⚠️ ${site.name} : problème détecté sur le site`, [
        `Problème détecté le ${parisTime(now)} par la surveillance automatique de ${site.url} :`,
        "",
        ...problems.map((p) => `- ${p.what} : ${p.detail}`),
        "",
        "Pistes :",
        "- base de données : bandeau d'alerte dans la console Neon (quota, compte) ;",
        "- Opisto : API indisponible ou identifiants refusés ;",
        "- site : Vercel → projet cazenave-pieces-auto → Observability / Logs.",
        "",
        "Un rappel suit toutes les 3 heures tant que le problème dure, puis un message dès que tout est rétabli.",
      ]);
      await writeOpenAlert({ since: since.toISOString(), lastSentAt: now.toISOString() });
      return;
    }

    // Tout va bien : fin d'alerte enregistrée, ou longue absence de synchro réussie (panne de base non enregistrable)
    const lastOk = open ? null : await previousSuccessAt(context.runId ?? null);
    const gap = lastOk ? now.getTime() - lastOk.getTime() : 0;
    if (open || gap > SYNC_GAP_MS) {
      const since = open ? new Date(open.since) : lastOk!;
      await notify(`✅ ${site.name} : site rétabli`, [
        `Tout refonctionne depuis le ${parisTime(now)} : base de données, synchronisation Opisto et pages vérifiées.`,
        `Durée de l'interruption : environ ${duration(now.getTime() - since.getTime())}.`,
      ]);
      await writeOpenAlert(null);
    }
  } catch (err) {
    console.error("[surveillance]", err instanceof Error ? err.message : err);
  }
}
