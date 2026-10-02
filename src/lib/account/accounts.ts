import "server-only";
import { desc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { customerAccounts, orders, type CustomerAccountRow, type OrderRow } from "@/db/schema";
import { findClientsByEmail, getClient } from "@/lib/opisto/client";
import type { PublicAccount } from "./pricing";
import { getSessionEmail } from "./session";

/** Remise des comptes professionnels, en pourcentage (PRO_DISCOUNT_PERCENT, 20 par défaut). */
export const PRO_DISCOUNT_RATE = Math.min(90, Math.max(0, Number(process.env.PRO_DISCOUNT_PERCENT ?? 20) || 0)) / 100;
/** Le statut professionnel est relu dans Opisto au plus toutes les 6 heures. */
const REFRESH_MS = 6 * 3600 * 1000;

export type Account = PublicAccount & { opistoClientIds: number[] };

function toAccount(row: CustomerAccountRow): Account {
  return {
    email: row.email,
    firstname: row.firstname,
    company: row.company,
    isPro: row.isPro,
    discountRate: row.isPro ? PRO_DISCOUNT_RATE : 0,
    opistoClientIds: row.opistoClientIds,
  };
}

export function publicAccount(a: Account): PublicAccount {
  return { email: a.email, firstname: a.firstname, company: a.company, isPro: a.isPro, discountRate: a.discountRate };
}

/** Clients Opisto portant cet e-mail : statut pro (filtre « professionnels » d'Opisto 360), prénom, société. */
async function readOpisto(email: string): Promise<Partial<CustomerAccountRow>> {
  const clients = await findClientsByEmail(email);
  const main = clients.find((c) => c.IsProfessional === true) ?? clients[0];
  let firstname: string | null = null;
  let company: string | null = null;
  if (main) {
    const full = await getClient(main.Id).catch(() => null);
    firstname = full?.Identity?.Firstname?.trim() || null;
    company = full?.Professional?.CompanyName?.trim() || null;
  }
  return {
    opistoClientIds: [...(main ? [main.Id] : []), ...clients.filter((c) => c !== main).map((c) => c.Id)],
    isPro: clients.some((c) => c.IsProfessional === true),
    firstname,
    company,
    checkedAt: new Date(),
  };
}

/** Compte du site pour cet e-mail (créé au besoin), statut pro rafraîchi depuis Opisto si nécessaire. */
export async function loadAccount(rawEmail: string, opts: { refresh?: boolean; login?: boolean } = {}): Promise<Account> {
  const email = rawEmail.trim().toLowerCase();
  const db = await getDb();
  const [existing] = await db.select().from(customerAccounts).where(eq(customerAccounts.email, email)).limit(1);
  const stale = !existing?.checkedAt || Date.now() - existing.checkedAt.getTime() > REFRESH_MS;

  const patch: Partial<CustomerAccountRow> = {};
  if (opts.refresh || stale) {
    try {
      Object.assign(patch, await readOpisto(email));
    } catch (err) {
      // Opisto indisponible : on garde le statut connu
      console.warn("[compte] lecture Opisto impossible :", err instanceof Error ? err.message : err);
    }
  }
  if (opts.login) patch.lastLoginAt = new Date();
  if (patch.firstname === null && existing?.firstname) delete patch.firstname;
  if (patch.company === null && existing?.company) delete patch.company;

  if (!existing) {
    const [row] = await db.insert(customerAccounts).values({ email, ...patch }).onConflictDoNothing().returning();
    if (row) return toAccount(row);
    const [again] = await db.select().from(customerAccounts).where(eq(customerAccounts.email, email)).limit(1);
    return toAccount(again);
  }
  if (!Object.keys(patch).length) return toAccount(existing);
  const [row] = await db.update(customerAccounts).set(patch).where(eq(customerAccounts.email, email)).returning();
  return toAccount(row);
}

/** Compte du client connecté (cookie de session), ou null. */
export async function currentAccount(): Promise<Account | null> {
  const email = await getSessionEmail();
  if (!email) return null;
  try {
    return await loadAccount(email);
  } catch (err) {
    console.warn("[compte] chargement impossible :", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Commandes payées passées sur le site avec cet e-mail ou depuis ce compte, des plus récentes aux plus anciennes. */
export async function accountOrders(email: string): Promise<OrderRow[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(or(eq(orders.email, email), eq(orders.accountEmail, email)))
    .orderBy(desc(orders.createdAt))
    .limit(50);
  return rows.filter((o) => o.status !== "pending" && o.status !== "cancelled");
}
