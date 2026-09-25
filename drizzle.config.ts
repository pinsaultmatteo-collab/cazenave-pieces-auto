import { defineConfig } from "drizzle-kit";

/**
 * Génération des migrations SQL : `npm run db:generate`.
 * L'application des migrations est faite par le code (src/db/index.ts),
 * aussi bien sur PGlite en local que sur Neon en production.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost/cazenave" },
});
