import "server-only";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * Connexion à la base.
 * - DATABASE_URL renseignée (Vercel + Neon) : pilote HTTP sans connexion
 *   persistante, adapté aux fonctions serverless.
 * - Sinon (développement) : PGlite, un Postgres embarqué stocké dans
 *   `.data/pglite`, aucun serveur à installer.
 * Les migrations générées par drizzle-kit sont appliquées au premier accès.
 */
/** Type commun aux deux pilotes (Neon HTTP, PGlite). */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

type Holder = { db?: Db; ready?: Promise<Db>; kind?: "neon" | "pglite" };
const holder = globalThis as unknown as { __cazenaveDb?: Holder };
const store: Holder = holder.__cazenaveDb ?? (holder.__cazenaveDb = {});

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    const db = drizzle(url, { schema });
    if (process.env.AUTO_MIGRATE !== "0") await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    store.kind = "neon";
    return db;
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("DATABASE_URL manquante : la base Neon doit être configurée sur Vercel.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(path.join(process.cwd(), ".data", "pglite"));
  await client.waitReady;
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  store.kind = "pglite";
  return db;
}

/** Base prête à l'emploi (singleton par processus). */
export function getDb(): Promise<Db> {
  if (store.db) return Promise.resolve(store.db);
  if (!store.ready) {
    store.ready = connect().then((db) => {
      store.db = db;
      return db;
    });
    store.ready.catch(() => {
      store.ready = undefined;
    });
  }
  return store.ready;
}

export function dbKind() {
  return store.kind ?? (process.env.DATABASE_URL ? "neon" : "pglite");
}

export { schema };
