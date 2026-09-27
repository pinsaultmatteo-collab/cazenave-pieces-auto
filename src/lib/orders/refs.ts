import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans 0/O, 1/I/L

/** Référence publique de commande, ex. CZ-K3H7Q2M9 (peu devinable, lisible au téléphone). */
export function newOrderRef(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `CZ-${out}`;
}

function secret(): string {
  return process.env.ORDERS_TOKEN_SECRET || process.env.SYNC_SECRET || "dev-orders-secret";
}

/** Jeton d'accès à une commande (page de confirmation, paiement simulé). */
export function orderToken(ref: string): string {
  return createHmac("sha256", secret()).update(ref).digest("base64url").slice(0, 24);
}

export function verifyOrderToken(ref: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = orderToken(ref);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
