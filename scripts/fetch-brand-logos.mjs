#!/usr/bin/env node
/**
 * Télécharge les logos des marques du stock depuis le jeu de données
 * public « car-logos-dataset » (miniatures PNG) vers public/brands/ et
 * écrit src/content/brand-logos.json (slug du site → chemin du logo).
 *
 *   node scripts/fetch-brand-logos.mjs renault peugeot …   (ou sans argument : liste ci-dessous)
 */
import fs from "node:fs";
import path from "node:path";

const MANIFEST = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/data.json";
const DEFAULT = "aixam alfa-romeo audi bmw chevrolet chrysler citroen dacia daewoo daihatsu dodge ds fiat ford goupil honda hyundai infiniti iveco jaguar jeep kia lada lancia land-rover lexus mazda mercedes mg mini mitsubishi nissan opel peugeot porsche renault rover saab seat skoda smart ssangyong subaru suzuki tesla toyota vauxhall volkswagen volvo cupra abarth".split(" ");
/** Nos slugs qui diffèrent de ceux du jeu de données */
const ALIASES = { mercedes: "mercedes-benz", ds: "ds", mg: "mg", "land-rover": "land-rover", vauxhall: "vauxhall" };

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
const manifest = await fetch(MANIFEST).then((r) => r.json());
const bySlug = new Map(manifest.map((m) => [m.slug, m]));
const byName = new Map(manifest.map((m) => [m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), m]));
const outDir = path.join("public", "brands");
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join("src", "content", "brand-logos.json");
const existing = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : {};
const result = { ...existing };
let ok = 0;
for (const slug of wanted) {
  const key = ALIASES[slug] ?? slug;
  const entry = bySlug.get(key) ?? byName.get(key) ?? bySlug.get(slug);
  if (!entry) { console.log("  absent :", slug); continue; }
  const file = path.join(outDir, `${slug}.png`);
  const res = await fetch(entry.image.thumb);
  if (!res.ok) { console.log("  échec :", slug, res.status); continue; }
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  result[slug] = `/brands/${slug}.png`;
  ok += 1;
}
fs.writeFileSync(jsonPath, JSON.stringify(Object.fromEntries(Object.entries(result).sort()), null, 2) + "\n");
console.log(`${ok} logos enregistrés, ${Object.keys(result).length} au total dans ${jsonPath}`);
