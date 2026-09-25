#!/usr/bin/env node
/**
 * Exploration de l'API Opisto : authentification puis lecture de quelques
 * routes pour observer la forme réelle des réponses (objets ReadSearch,
 * Token… non décrits dans la documentation).
 *
 * Usage : node scripts/opisto-discover.mjs [dossier-de-sortie]
 * Lit .env.local (OPISTO_ENV, OPISTO_USERNAME, OPISTO_PASSWORD,
 * OPISTO_CASSE_ID, OPISTO_SECRET_ID). N'affiche jamais les secrets.
 */
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const ENV = process.env.OPISTO_ENV === "prod" ? "prod" : "preprod";
const BASES = {
  preprod: { ops: "https://api-preprod.opisto.fr:8443/v2.15", auth: "https://api-preprod.opisto.fr:8443/v2.15/auth" },
  prod: { ops: "https://api.opisto.fr/v2.15", auth: "https://api.opisto.fr/auth/v1.1" },
}[ENV];
const OUT = path.resolve(process.argv[2] ?? ".data/opisto-discovery");
fs.mkdirSync(OUT, { recursive: true });

const creds = {
  CasseId: Number(process.env.OPISTO_CASSE_ID),
  Password: process.env.OPISTO_PASSWORD,
  SecretId: process.env.OPISTO_SECRET_ID,
  Username: process.env.OPISTO_USERNAME,
};
if (!creds.Password || !creds.SecretId || !creds.Username) {
  console.error("Identifiants Opisto absents de .env.local");
  process.exit(1);
}

const mask = (s) => String(s).replace(/[A-Za-z0-9+/=_\-!()'*{}\[\]^@&]{14,}/g, (m) => m.slice(0, 3) + "…" + m.slice(-2));

/** Décrit la structure d'une valeur JSON (clés et types), sans les valeurs. */
function shape(v, depth = 0) {
  if (depth > 4) return "…";
  if (Array.isArray(v)) return v.length ? [shape(v[0], depth + 1), `(${v.length} éléments)`] : "[]";
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x, depth + 1)]));
  if (typeof v === "string") return v.length > 40 ? `string(${v.length})` : `string:${v}`;
  return typeof v === "number" ? `number:${v}` : String(v);
}

async function call(url, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json", "User-Agent": "cazenave-site/discovery" };
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Token = token;
  const started = Date.now();
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* pas du JSON */
  }
  console.log(`${method} ${url.replace(BASES.ops, "").replace(BASES.auth, "/auth")} → ${res.status} (${Date.now() - started} ms)`);
  return { status: res.status, json, text };
}

function save(name, data) {
  const file = path.join(OUT, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`  ↳ ${path.relative(process.cwd(), file)}`);
}

const auth = await call(`${BASES.auth}/generate`, { method: "POST", body: creds });
console.log("  structure :", JSON.stringify(shape(auth.json)));
if (auth.status !== 200 || !auth.json) {
  console.error("  Réponse :", mask(auth.text).slice(0, 300));
  process.exit(2);
}
const token = auth.json.AccessToken ?? auth.json.Token ?? auth.json.token ?? (typeof auth.json === "string" ? auth.json : null);
save("auth", { ...auth.json, AccessToken: token ? mask(token) : undefined });
if (!token) {
  console.error("  Jeton introuvable dans la réponse");
  process.exit(3);
}

const routes = [
  ["version", "/version"],
  ["categories", "/categories"],
  ["brands-car-main", "/vehicles/brands/4"],
  ["countries", "/geography/countries"],
  ["parts-page0", "/parts?itemsPerPage=5&page=0&onlyParts=true"],
  ["parts-updated", `/parts?startUpdateDate=01-01-2026&endUpdateDate=31-12-2026&itemsPerPage=3&page=0&onlyParts=true`],
  ["vehicles-page0", "/vehicles?itemsPerPage=3&page=0"],
];
const results = {};
for (const [name, route] of routes) {
  const r = await call(`${BASES.ops}${route}`, { token });
  results[name] = r.json ?? r.text;
  console.log("  structure :", JSON.stringify(shape(r.json ?? r.text)).slice(0, 1200));
  save(name, r.json ?? { raw: r.text.slice(0, 2000) });
  await new Promise((ok) => setTimeout(ok, 700));
}

// Détail d'une pièce si la recherche en a renvoyé
const firstList = results["parts-page0"];
const candidates = [firstList?.Value?.Parts, firstList?.Value?.Items, firstList?.Parts, firstList?.Items, firstList?.Value, firstList].find(Array.isArray);
const firstId = candidates?.[0]?.Id;
if (firstId) {
  const r = await call(`${BASES.ops}/parts/${firstId}`, { token });
  console.log("  structure :", JSON.stringify(shape(r.json)).slice(0, 1500));
  save("part-detail", r.json);
} else {
  console.log("Aucune pièce dans la première page : pas de détail à lire.");
}

const quotas = await call(`${BASES.auth}/quotas`, { method: "POST", body: { AccessToken: token } });
console.log("  quotas :", JSON.stringify(quotas.json));
save("quotas", quotas.json);
console.log("\nTerminé. Fichiers dans", path.relative(process.cwd(), OUT));
