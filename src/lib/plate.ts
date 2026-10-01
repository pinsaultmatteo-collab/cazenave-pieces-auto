import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { plateLookups } from "@/db/schema";
import { getBrands, getModels, getPhases } from "@/lib/catalog";
import { phasesForYear } from "@/lib/catalog/phases";
import { slugify } from "@/lib/slug";
import { titleCase } from "@/lib/opisto/mapper";

export { normalizePlate } from "@/lib/plate-format";

/**
 * Recherche par plaque d'immatriculation : « Api plaque immatriculation SIV »
 * sur RapidAPI (clé PLATE_API_KEY). Chaque plaque n'est payée qu'une fois :
 * la réponse est gardée en base. Si le service est indisponible (quota
 * atteint, panne), la page propose la recherche par marque et modèle.
 */
const HOST = "api-plaque-immatriculation-siv.p.rapidapi.com";
const TIMEOUT_MS = 15_000;
/** Une plaque inconnue n'est réinterrogée qu'au bout d'une semaine. */
const NOT_FOUND_TTL_MS = 7 * 24 * 3600 * 1000;

export type PlateVehicle = {
  plate: string;
  brand: string;
  model: string;
  version: string | null;
  year: number | null;
  firstRegistration: string | null;
  energy: string | null;
  gearbox: string | null;
  doors: number | null;
  bodyType: string | null;
  ktype: number | null;
  engineCodes: string[];
  photo: string | null;
};

export type PlateResult =
  | { status: "found"; vehicle: PlateVehicle }
  | { status: "not_found" | "unavailable" | "not_configured" };

export function plateSearchConfigured(): boolean {
  return Boolean(process.env.PLATE_API_KEY);
}

const GEARBOX: Record<string, string> = { A: "Automatique", M: "Manuelle", S: "Séquentielle", V: "Variable continue", X: "Manuelle robotisée" };
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const int = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

function toVehicle(plate: string, d: Record<string, unknown>): PlateVehicle | null {
  const brand = str(d.marque);
  const model = str(d.modele);
  if (!brand || !model) return null;
  const firstRegistration = str(d.date1erCir_us);
  const year = firstRegistration ? Number(firstRegistration.slice(0, 4)) : null;
  return {
    plate,
    brand: titleCase(brand) ?? brand,
    model: titleCase(model) ?? model,
    version: str(d.version),
    year: year && year > 1900 ? year : null,
    firstRegistration,
    energy: str(d.energieNGC),
    gearbox: GEARBOX[str(d.boite_vitesse) ?? ""] ?? null,
    doors: int(d.nb_portes),
    bodyType: str(d.carrosserie),
    ktype: int(d.k_type),
    engineCodes: (str(d.code_moteur) ?? "").split(",").map((c) => c.trim()).filter(Boolean),
    photo: str(d.photo_modele),
  };
}

async function readCache(plate: string) {
  try {
    const db = await getDb();
    const [row] = await db.select().from(plateLookups).where(eq(plateLookups.plate, plate)).limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

async function writeCache(plate: string, found: boolean, data: Record<string, unknown> | null) {
  try {
    const db = await getDb();
    await db
      .insert(plateLookups)
      .values({ plate, found, data, createdAt: new Date() })
      .onConflictDoUpdate({ target: plateLookups.plate, set: { found, data, createdAt: new Date() } });
  } catch (err) {
    console.warn("[plaque] mise en cache impossible :", err instanceof Error ? err.message : err);
  }
}

/** Identifie le véhicule d'une plaque (mémoire d'abord, sinon appel payant). */
export async function lookupPlate(plate: string): Promise<PlateResult> {
  const cached = await readCache(plate);
  if (cached?.found && cached.data) {
    const vehicle = toVehicle(plate, cached.data);
    if (vehicle) return { status: "found", vehicle };
  }
  if (cached && !cached.found && Date.now() - cached.createdAt.getTime() < NOT_FOUND_TTL_MS) return { status: "not_found" };

  const key = process.env.PLATE_API_KEY;
  if (!key) return { status: "not_configured" };

  const url = new URL(`https://${HOST}/get-vehicule-info`);
  url.searchParams.set("token", "TokenDemoRapidapi");
  url.searchParams.set("host_name", "https://apiplaqueimmatriculation.com");
  url.searchParams.set("immatriculation", plate);
  try {
    const res = await fetch(url, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    // 403 : abonnement absent, 429 : quota du mois atteint
    if (!res.ok) {
      console.warn(`[plaque] service indisponible (HTTP ${res.status})`);
      return { status: "unavailable" };
    }
    const json = (await res.json()) as { data?: Record<string, unknown> | unknown[]; code_erreur?: number; message?: string };
    const data = json.data && !Array.isArray(json.data) ? json.data : null;
    const vehicle = data ? toVehicle(plate, data) : null;
    if (vehicle && data) {
      await writeCache(plate, true, data);
      return { status: "found", vehicle };
    }
    // Erreur d'abonnement ou de quota renvoyée dans le corps : ne pas mémoriser
    if (json.code_erreur === 401 || json.code_erreur === 429) return { status: "unavailable" };
    await writeCache(plate, false, null);
    return { status: "not_found" };
  } catch (err) {
    console.warn("[plaque] appel impossible :", err instanceof Error ? err.message : err);
    return { status: "unavailable" };
  }
}

const ROMAN: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6", vii: "7", viii: "8" };
/** Mots de carrosserie souvent absents des gammes Opisto (« Megane 3 » couvre le coupé et le break). */
const BODY_WORDS = new Set(["coupe", "break", "estate", "sw", "tourer", "berline", "cabriolet", "monospace", "fourgon", "van", "societe", "grandtour", "touring"]);

/** « MEGANE III Coupé » → [« megane-3-coupe », « megane-3 »] : nom complet, puis sans la carrosserie. */
function modelKeys(model: string): string[] {
  const words = slugify(model)
    .split("-")
    .filter(Boolean)
    .map((w) => ROMAN[w] ?? w);
  const cut = words.findIndex((w, i) => i > 0 && BODY_WORDS.has(w));
  const keys = [words.join("-")];
  if (cut > 0) keys.push(words.slice(0, cut).join("-"));
  return keys;
}

export type CatalogVehicle = { brand: string | null; model: string | null; year: number | null; phase: string | null };

/** Rapproche le véhicule de la plaque des marques, gammes et phases du catalogue. */
export async function matchCatalogVehicle(v: PlateVehicle): Promise<CatalogVehicle> {
  const brandSlug = slugify(v.brand);
  const brand = (await getBrands()).find((b) => b.slug === brandSlug || slugify(b.name) === brandSlug);
  if (!brand) return { brand: null, model: null, year: v.year, phase: null };

  const keys = modelKeys(v.model);
  const models = await getModels(brand.id);
  // Gamme identique, sinon la plus longue dont le nom est le début de celui de la plaque (« serie-3-e90 » → « serie-3 »).
  const model =
    keys.map((k) => models.find((m) => m.slug === k)).find(Boolean) ??
    models.filter((m) => keys[0].startsWith(`${m.slug}-`)).sort((a, b) => b.slug.length - a.slug.length)[0] ??
    null;
  if (!model) return { brand: brand.slug, model: null, year: v.year, phase: null };

  let phase: string | null = null;
  if (v.year) {
    const matches = phasesForYear(await getPhases(brand.slug, model.slug), v.year);
    if (matches.length === 1) phase = matches[0].slug;
  }
  return { brand: brand.slug, model: model.slug, year: v.year, phase };
}
