import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { loginCodes } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";
import { authSecret } from "./session";

/** Connexion sans mot de passe : code à 6 chiffres envoyé par e-mail, valable 15 minutes. */
const TTL_MS = 15 * 60 * 1000;
const MAX_CODES_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

const hash = (email: string, code: string) => createHmac("sha256", authSecret()).update(`${email}:${code}`).digest("hex");

export type IssueResult = { ok: true; devCode?: string } | { ok: false; reason: "rate_limited" | "email_unavailable" };

export async function issueLoginCode(rawEmail: string): Promise<IssueResult> {
  const email = rawEmail.trim().toLowerCase();
  const db = await getDb();
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(loginCodes)
    .where(and(eq(loginCodes.email, email), gt(loginCodes.createdAt, new Date(Date.now() - 3600 * 1000))));
  if (Number(n) >= MAX_CODES_PER_HOUR) return { ok: false, reason: "rate_limited" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert(loginCodes).values({ email, codeHash: hash(email, code), expiresAt: new Date(Date.now() + TTL_MS) });

  const sent = await sendEmail({
    to: email,
    subject: `Votre code de connexion : ${code}`,
    text: [
      "Bonjour,",
      "",
      `Voici votre code pour vous connecter à votre compte ${site.name} : ${code}`,
      "Il est valable 15 minutes et ne peut servir qu'une fois.",
      "",
      "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
      "",
      `${site.name} · ${site.phone}`,
    ].join("\n"),
  });
  if (sent.delivered) return { ok: true };
  // Sans service d'envoi : le code n'est montré qu'en développement local
  if (process.env.NODE_ENV !== "production") return { ok: true, devCode: code };
  return { ok: false, reason: "email_unavailable" };
}

/** Vérifie le dernier code envoyé à cet e-mail (5 essais au plus). */
export async function verifyLoginCode(rawEmail: string, rawCode: string): Promise<boolean> {
  const email = rawEmail.trim().toLowerCase();
  const code = rawCode.replace(/\D/g, "");
  if (code.length !== 6) return false;
  const db = await getDb();
  const [row] = await db
    .select()
    .from(loginCodes)
    .where(and(eq(loginCodes.email, email), isNull(loginCodes.usedAt), gt(loginCodes.expiresAt, new Date())))
    .orderBy(desc(loginCodes.createdAt))
    .limit(1);
  if (!row || row.attempts >= MAX_ATTEMPTS) return false;
  const expected = Buffer.from(row.codeHash);
  const given = Buffer.from(hash(email, code));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    await db.update(loginCodes).set({ attempts: row.attempts + 1 }).where(eq(loginCodes.id, row.id));
    return false;
  }
  await db.update(loginCodes).set({ usedAt: new Date() }).where(eq(loginCodes.id, row.id));
  return true;
}
