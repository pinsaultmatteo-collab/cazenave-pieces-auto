import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Session client : cookie signé (HMAC) contenant l'e-mail et l'expiration.
 * Aucune donnée sensible dedans ; le statut pro est relu en base.
 */
export const SESSION_COOKIE = "cz_session";
const MAX_AGE_S = 30 * 24 * 3600;

export function authSecret(): string {
  return process.env.SESSION_SECRET || process.env.ORDERS_TOKEN_SECRET || process.env.SYNC_SECRET || "dev-session-secret";
}

const sign = (payload: string) => createHmac("sha256", authSecret()).update(payload).digest("base64url");

function encode(email: string): string {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + MAX_AGE_S })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(value: string | undefined): string | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e?: string; x?: number };
    return e && x && x > Date.now() / 1000 ? e : null;
  } catch {
    return null;
  }
}

/** E-mail du client connecté, ou null. */
export async function getSessionEmail(): Promise<string | null> {
  return decode((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function openSession(email: string) {
  (await cookies()).set(SESSION_COOKIE, encode(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function closeSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
