#!/usr/bin/env node
/**
 * Lance la synchronisation Opisto en appelant l'API du site jusqu'à ce
 * qu'elle réponde `done: true`.
 *
 *   npm run sync                 delta (ou reprise d'un full en cours)
 *   npm run sync:full            parcours complet du stock
 *   SITE_URL=https://... npm run sync   cible un déploiement
 *
 * Variables : SITE_URL (défaut http://localhost:3000), SYNC_SECRET.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const full = process.argv.includes("--full");
const base = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.SYNC_SECRET ?? "";
const maxCalls = Number(process.env.SYNC_MAX_CALLS ?? 60);

const headers = { Authorization: `Bearer ${secret}`, Accept: "application/json" };
let first = true;
for (let i = 1; i <= maxCalls; i += 1) {
  const url = `${base}/api/sync${full && first ? "?mode=full" : ""}`;
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(url, { method: "POST", headers });
  } catch (err) {
    console.error(`✖ ${base} injoignable : ${err.message}`);
    process.exit(1);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`✖ HTTP ${res.status}`, body.error ?? body);
    process.exit(1);
  }
  const cur = body.cursor ? ` page ${body.cursor.page}${body.cursor.total ? `/${Math.ceil(body.cursor.total / 100)}` : ""}` : "";
  console.log(
    `#${i} ${body.mode}${cur} | +${body.partsUpserted} pièces, ${body.partsDeleted} retirées, ${body.vehiclesUpserted} véhicules | ${body.requests} appels | ${Math.round((Date.now() - t0) / 1000)} s${body.skipped ? ` | ignoré (${body.skipped})` : ""}`,
  );
  if (body.skipped) {
    // Une autre synchronisation tient le verrou : on réessaie, en gardant le mode demandé.
    await new Promise((r) => setTimeout(r, 30_000));
    continue;
  }
  first = false;
  if (body.done) {
    const status = await fetch(`${base}/api/sync`, { headers }).then((r) => r.json()).catch(() => null);
    if (status?.counts) console.log("État :", JSON.stringify(status.counts));
    process.exit(0);
  }
}
console.error("✖ Budget d'appels épuisé sans terminer.");
process.exit(2);
