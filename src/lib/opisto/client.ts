import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { opistoTokens } from "@/db/schema";
import type { OpistoCategory, OpistoPart, OpistoPartsPage, OpistoQuotas, OpistoToken, OpistoVehiclesPage } from "./types";

/**
 * Client HTTP de l'API Opisto v2.15.
 * - Environnement choisi par OPISTO_ENV (preprod | prod).
 * - Jeton généré à la demande, partagé via la base (validité 14 jours),
 *   régénéré une fois si l'API le refuse.
 * - Espacement minimal entre deux appels pour respecter les quotas.
 */
export type OpistoEnv = "preprod" | "prod";

const BASES: Record<OpistoEnv, { ops: string; auth: string }> = {
  preprod: { ops: "https://api-preprod.opisto.fr:8443/v2.15", auth: "https://api-preprod.opisto.fr:8443/v2.15/auth" },
  prod: { ops: "https://api.opisto.fr/v2.15", auth: "https://api.opisto.fr/auth/v1.1" },
};

export class OpistoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "OpistoError";
  }
}

export function opistoEnv(): OpistoEnv {
  return process.env.OPISTO_ENV === "prod" ? "prod" : "preprod";
}

export function casseId(): number {
  const id = Number(process.env.OPISTO_CASSE_ID);
  if (!Number.isInteger(id)) throw new Error("OPISTO_CASSE_ID manquant");
  return id;
}

function credentials() {
  const { OPISTO_USERNAME, OPISTO_PASSWORD, OPISTO_SECRET_ID } = process.env;
  if (!OPISTO_USERNAME || !OPISTO_PASSWORD || !OPISTO_SECRET_ID) throw new Error("Identifiants Opisto manquants (OPISTO_USERNAME, OPISTO_PASSWORD, OPISTO_SECRET_ID)");
  return { CasseId: casseId(), Username: OPISTO_USERNAME, Password: OPISTO_PASSWORD, SecretId: OPISTO_SECRET_ID };
}

const MIN_INTERVAL_MS = Number(process.env.OPISTO_MIN_INTERVAL_MS ?? 250);
let lastCallAt = 0;
let requestCount = 0;

/** Nombre d'appels effectués par ce processus (pour les rapports). */
export function opistoRequestCount() {
  return requestCount;
}

async function throttle() {
  const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
  requestCount += 1;
}

async function generateToken(): Promise<{ token: string; expiresAt: Date }> {
  await throttle();
  const res = await fetch(`${BASES[opistoEnv()].auth}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials()),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new OpistoError(`Authentification Opisto refusée (${res.status})`, res.status, text);
  const json = JSON.parse(text) as OpistoToken;
  if (!json.AccessToken) throw new OpistoError("Réponse d'authentification sans jeton", res.status, text);
  // Expiration en secondes Unix ; marge d'un jour.
  const expiresAt = new Date((json.Expiration - 86400) * 1000);
  return { token: json.AccessToken, expiresAt };
}

let memoryToken: { token: string; expiresAt: Date } | null = null;

async function getToken(force = false): Promise<string> {
  const env = opistoEnv();
  if (!force && memoryToken && memoryToken.expiresAt > new Date()) return memoryToken.token;
  const db = await getDb();
  if (!force) {
    const [row] = await db.select().from(opistoTokens).where(eq(opistoTokens.env, env)).limit(1);
    if (row && row.expiresAt > new Date()) {
      memoryToken = { token: row.token, expiresAt: row.expiresAt };
      return row.token;
    }
  }
  const fresh = await generateToken();
  await db
    .insert(opistoTokens)
    .values({ env, token: fresh.token, expiresAt: fresh.expiresAt, updatedAt: new Date() })
    .onConflictDoUpdate({ target: opistoTokens.env, set: { token: fresh.token, expiresAt: fresh.expiresAt, updatedAt: new Date() } });
  memoryToken = fresh;
  return fresh.token;
}

/** Appel GET authentifié sur le service d'opérations. */
export async function opistoGet<T>(route: string, retry = true): Promise<T> {
  const token = await getToken();
  await throttle();
  const res = await fetch(`${BASES[opistoEnv()].ops}${route}`, {
    headers: { Token: token, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  if (res.status === 401 || (res.status === 403 && /token|jeton|-312/i.test(text))) {
    if (retry) {
      memoryToken = null;
      await getToken(true);
      return opistoGet<T>(route, false);
    }
  }
  if (res.status === 403) throw new OpistoError("Quota Opisto dépassé ou accès refusé", 403, text);
  if (!res.ok) throw new OpistoError(`Opisto ${route} → ${res.status}`, res.status, text.slice(0, 500));
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new OpistoError(`Réponse non JSON pour ${route}`, res.status, text.slice(0, 200));
  }
}

export async function opistoQuotas(): Promise<OpistoQuotas> {
  const token = await getToken();
  await throttle();
  const res = await fetch(`${BASES[opistoEnv()].auth}/quotas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ AccessToken: token }),
    cache: "no-store",
  });
  if (!res.ok) throw new OpistoError(`Quotas Opisto → ${res.status}`, res.status, await res.text());
  return (await res.json()) as OpistoQuotas;
}

/* ---------- routes métier ---------- */

export function fetchCategories() {
  return opistoGet<OpistoCategory[]>("/categories");
}

export type PartsQuery = {
  page: number;
  itemsPerPage?: number;
  startCreationDate?: string;
  endCreationDate?: string;
  startUpdateDate?: string;
  endUpdateDate?: string;
  startDeleteDate?: string;
  endDeleteDate?: string;
  vehicleId?: number;
};

export function fetchParts(q: PartsQuery) {
  const sp = new URLSearchParams({ page: String(q.page), itemsPerPage: String(q.itemsPerPage ?? 100), onlyParts: "true" });
  for (const key of ["startCreationDate", "endCreationDate", "startUpdateDate", "endUpdateDate", "startDeleteDate", "endDeleteDate"] as const) {
    if (q[key]) sp.set(key, q[key]!);
  }
  if (q.vehicleId) sp.set("vehicleId", String(q.vehicleId));
  return opistoGet<OpistoPartsPage>(`/parts?${sp}`);
}

export function fetchPart(id: number) {
  return opistoGet<OpistoPart>(`/parts/${id}`);
}

export function fetchVehicles(page: number, itemsPerPage = 50) {
  return opistoGet<OpistoVehiclesPage>(`/vehicles?page=${page}&itemsPerPage=${itemsPerPage}`);
}
