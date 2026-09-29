/**
 * Source « base de données » du catalogue : lit les tables synchronisées
 * depuis Opisto (voir src/lib/opisto/sync.ts). Même interface que `demo.ts`.
 */
import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, inArray, isNull, ne, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, categories, parts, ranges, subcategories, vehicles, type CategoryRow, type PartRow, type RangeRow, type SubCategoryRow, type VehicleRow } from "@/db/schema";
import type { Brand, Category, DoorOption, Paginated, Part, PartCondition, PartSearch, Vehicle, VehicleModel, VehiclePhase } from "./types";
import { slugify } from "@/lib/slug";
import { PER_PAGE } from "./links";
import { phasesForYear } from "./phases";

const CONDITIONS: PartCondition[] = ["GOOD", "CORRECT", "BAD"];

const num = (v: string | null | undefined): number | null => (v === null || v === undefined ? null : Number(v));
const iso = (d: Date | null | undefined): string | null => (d ? d.toISOString() : null);

/** Pièce visible sur le site : présente chez Opisto, disponible, en stock, non bloquée. */
const LIVE = and(isNull(parts.deletedAt), eq(parts.available, true), eq(parts.inStock, true), eq(parts.blocked, false))!;

/** Pièce photographiée elle-même (pas seulement son véhicule donneur, ni le visuel générique Opisto). */
const HAS_PHOTO = sql`${parts.ownPhotos} > 0 and ${parts.photos}::text not ilike '%no-photo%'`;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/* ---------- conversions ---------- */

function toCategory(r: CategoryRow): Category {
  return { id: r.id, slug: r.slug, name: r.name, image: null, parentId: null };
}

function toSubCategory(r: SubCategoryRow): Category {
  return { id: r.id, slug: r.slug, name: r.name, image: null, parentId: r.categoryId };
}

function toModel(r: RangeRow): VehicleModel {
  return { id: r.id, brandId: r.brandId, slug: r.slug, name: r.name };
}

function toPart(r: PartRow): Part {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    categoryId: r.categoryId ?? 0,
    categoryName: r.categoryName ?? "",
    subCategoryName: r.subCategoryName,
    brandId: r.brandId,
    brandName: r.brandName,
    modelName: r.modelName,
    phaseName: r.phaseName,
    yearFrom: r.yearFrom,
    yearTo: r.yearTo,
    doors: r.doors,
    version: r.version,
    vehicleId: r.vehicleId,
    priceHt: Number(r.priceHt),
    vatRate: Number(r.vatRate) / 100,
    priceTtc: Number(r.priceTtc),
    condition: CONDITIONS[r.condition] ?? "GOOD",
    partType: "USED",
    warrantyMonths: r.warrantyMonths,
    manufacturerReference: r.manufacturerReference,
    adaptableReference: r.adaptableReference,
    photos: r.photos,
    vignette: r.vignette,
    available: r.available && !r.blocked && r.deletedAt === null,
    inStock: r.inStock,
    shippingAvailable: r.shippingAvailable,
    shippingCost: num(r.shippingCost),
    shippingId: r.shippingId,
    characteristics: r.characteristics,
    engineCode: r.engineCode,
    gearboxCode: r.gearboxCode,
    mileage: r.mileage,
    color: r.color,
    firstRegistration: iso(r.firstRegistration),
    createdAt: (r.opistoCreatedAt ?? r.syncedAt).toISOString(),
    updatedAt: (r.opistoUpdatedAt ?? r.opistoCreatedAt ?? r.syncedAt).toISOString(),
  };
}

function toVehicle(r: VehicleRow): Vehicle {
  const price = num(r.salePrice);
  return {
    id: r.id,
    slug: r.slug,
    brandId: r.brandId ?? 0,
    brandName: r.brandName ?? "",
    modelName: r.rangeName ?? r.modelName ?? "",
    version: r.version,
    energy: r.energy,
    gearbox: r.gearbox,
    engineCode: r.engineCode,
    gearboxCode: r.gearboxCode,
    mileage: r.mileage,
    color: r.color,
    firstRegistration: iso(r.firstRegistration),
    price: r.forSale && price && price > 0 ? price : null,
    forSale: r.forSale,
    photos: r.photos,
    vignette: r.vignette,
    typeMine: r.typeMine,
    partsCount: r.partsCount,
  };
}

/* ---------- nomenclature ---------- */

type BrandGroup = { id: number; name: string; ids: number[] };

/**
 * Opisto connaît parfois une même marque sous plusieurs identifiants
 * (« MG », « ROVER »…). Le site les regroupe par adresse : le premier
 * identifiant représente le groupe, les requêtes couvrent tous les identifiants.
 */
async function brandGroups(): Promise<Map<string, BrandGroup>> {
  const db = await getDb();
  const rows = await db.select({ id: brands.id, name: brands.name, slug: brands.slug }).from(brands).orderBy(asc(brands.id));
  const groups = new Map<string, BrandGroup>();
  for (const r of rows) {
    const g = groups.get(r.slug);
    if (g) g.ids.push(r.id);
    else groups.set(r.slug, { id: r.id, name: r.name, ids: [r.id] });
  }
  return groups;
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.select().from(categories).orderBy(asc(categories.id));
  return rows.map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = await getDb();
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).orderBy(asc(categories.id)).limit(1);
  if (row) return toCategory(row);
  const [sub] = await db.select().from(subcategories).where(eq(subcategories.slug, slug)).orderBy(asc(subcategories.id)).limit(1);
  return sub ? toSubCategory(sub) : null;
}

export async function getBrands(): Promise<Brand[]> {
  const [groups, counts] = await Promise.all([brandGroups(), getBrandCounts()]);
  return [...groups.entries()]
    .filter(([, g]) => (counts[g.id] ?? 0) > 0)
    .map(([slug, g]) => ({ id: g.id, slug, name: g.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const g = (await brandGroups()).get(slug);
  return g ? { id: g.id, slug, name: g.name } : null;
}

export async function getModels(brandId: number): Promise<VehicleModel[]> {
  const group = [...(await brandGroups()).values()].find((g) => g.ids.includes(brandId));
  const ids = group?.ids ?? [brandId];
  const db = await getDb();
  const rows = await db
    .select()
    .from(ranges)
    .where(and(inArray(ranges.brandId, ids), sql`exists (select 1 from ${parts} where ${parts.rangeId} = ${ranges.id} and ${LIVE})`))
    .orderBy(asc(ranges.name), asc(ranges.id));
  const seen = new Set<string>();
  return rows
    .filter((r) => (seen.has(r.slug) ? false : (seen.add(r.slug), true)))
    .map((r) => ({ ...toModel(r), brandId: group?.id ?? brandId }));
}

export async function getBrandCounts(): Promise<Record<number, number>> {
  const db = await getDb();
  const [groups, rows] = await Promise.all([brandGroups(), db.select({ id: parts.brandId, n: count() }).from(parts).where(LIVE).groupBy(parts.brandId)]);
  const representative = new Map<number, number>();
  for (const g of groups.values()) for (const id of g.ids) representative.set(id, g.id);
  const out: Record<number, number> = {};
  for (const r of rows) {
    if (!r.id) continue;
    const key = representative.get(r.id) ?? r.id;
    out[key] = (out[key] ?? 0) + Number(r.n);
  }
  return out;
}

export async function getCategoryCounts(): Promise<Record<number, number>> {
  const db = await getDb();
  const rows = await db.select({ id: parts.categoryId, n: count() }).from(parts).where(LIVE).groupBy(parts.categoryId);
  const out: Record<number, number> = {};
  for (const r of rows) if (r.id) out[r.id] = Number(r.n);
  return out;
}

/* ---------- pièces ---------- */

const EMPTY = (page: number, perPage: number): Paginated<Part> => ({ items: [], total: 0, page, perPage, pages: 1 });

/** Gammes (« Clio 4 ») correspondant au slug, dans le groupe de la marque si elle est donnée. */
async function rangeIds(brand: string | undefined, model: string): Promise<number[]> {
  let brandIds: number[] | null = null;
  if (brand) {
    const g = (await brandGroups()).get(brand);
    if (!g) return [];
    brandIds = g.ids;
  }
  const db = await getDb();
  const where = brandIds ? and(eq(ranges.slug, model), inArray(ranges.brandId, brandIds)) : eq(ranges.slug, model);
  return (await db.select({ id: ranges.id }).from(ranges).where(where)).map((r) => r.id);
}

type PhaseWithIds = VehiclePhase & { ids: number[] };

/**
 * Phases en stock d'une gamme : modèles Opisto regroupés par nom. La période
 * retenue est celle de la majorité des pièces (quelques véhicules sont
 * rattachés à une version d'une autre phase dans Opisto) ; à défaut de
 * dates, on prend les années des véhicules donneurs. Mis en cache le temps
 * d'une requête.
 */
const phasesForRanges = cache(async (key: string): Promise<PhaseWithIds[]> => {
  const ids = key.split(",").map(Number).filter(Boolean);
  if (!ids.length) return [];
  const db = await getDb();
  const [rangeRow] = await db.select({ name: ranges.name }).from(ranges).where(inArray(ranges.id, ids)).limit(1);
  const rows = await db
    .select({
      modelId: parts.modelId,
      name: parts.phaseName,
      from: parts.yearFrom,
      to: parts.yearTo,
      minYear: sql<number | null>`min(${parts.year})`,
      maxYear: sql<number | null>`max(${parts.year})`,
      n: count(),
    })
    .from(parts)
    .where(and(LIVE, inArray(parts.rangeId, ids), sql`${parts.modelId} is not null and ${parts.phaseName} ~ '[[:alnum:]]'`))
    .groupBy(parts.modelId, parts.phaseName, parts.yearFrom, parts.yearTo);

  type Acc = PhaseWithIds & { spans: Map<string, number>; minYear: number | null; maxYear: number | null };
  const prefix = normalize(rangeRow?.name ?? "") + " ";
  const bySlug = new Map<string, Acc>();
  for (const r of rows) {
    const name = r.name!;
    const slug = slugify(name);
    let acc = bySlug.get(slug);
    if (!acc) {
      const short = normalize(name).startsWith(prefix) ? name.slice(prefix.length).trim() : "";
      const label = short ? short.charAt(0).toUpperCase() + short.slice(1) : name;
      acc = { slug, name, label, from: null, to: null, count: 0, ids: [], spans: new Map(), minYear: null, maxYear: null };
      bySlug.set(slug, acc);
    }
    const n = Number(r.n);
    acc.count += n;
    if (!acc.ids.includes(r.modelId!)) acc.ids.push(r.modelId!);
    if (r.from !== null) {
      const span = `${r.from}-${r.to ?? ""}`;
      acc.spans.set(span, (acc.spans.get(span) ?? 0) + n);
    }
    if (r.minYear !== null) acc.minYear = Math.min(acc.minYear ?? 9999, Number(r.minYear));
    if (r.maxYear !== null) acc.maxYear = Math.max(acc.maxYear ?? 0, Number(r.maxYear));
  }

  const phases: PhaseWithIds[] = [];
  for (const { spans, minYear, maxYear, ...p } of bySlug.values()) {
    const best = [...spans].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (best) {
      const [from, to] = best.split("-");
      p.from = Number(from);
      p.to = to ? Number(to) : null;
    } else {
      p.from = minYear;
      p.to = maxYear;
    }
    phases.push(p);
  }
  return phases.sort((a, b) => (a.from ?? 9999) - (b.from ?? 9999) || a.label.localeCompare(b.label, "fr"));
});

/** Phases disponibles pour un modèle (gamme) d'une marque. */
export async function getPhases(brand: string | undefined, model: string): Promise<VehiclePhase[]> {
  const ids = await rangeIds(brand, model);
  const phases = await phasesForRanges(ids.sort((a, b) => a - b).join(","));
  return phases.map((p) => ({ slug: p.slug, name: p.name, label: p.label, from: p.from, to: p.to, count: p.count }));
}

/** Nombres de portes présents dans les résultats (hors filtre portes). */
export async function getDoorOptions(params: PartSearch): Promise<DoorOption[]> {
  const conds = await buildConditions({ ...params, doors: undefined });
  if (!conds) return [];
  const db = await getDb();
  const rows = await db
    .select({ value: parts.doors, n: count() })
    .from(parts)
    .where(and(...conds, sql`${parts.doors} > 0`))
    .groupBy(parts.doors)
    .orderBy(asc(parts.doors));
  return rows.map((r) => ({ value: Number(r.value), count: Number(r.n) }));
}

async function buildConditions(params: PartSearch): Promise<SQL[] | null> {
  const conds: SQL[] = [LIVE];
  if (params.category) {
    const cat = await getCategoryBySlug(params.category);
    if (!cat) return null;
    conds.push(cat.parentId === null ? eq(parts.categoryId, cat.id) : eq(parts.subCategoryId, cat.id));
  }
  if (params.brand) {
    const g = (await brandGroups()).get(params.brand);
    if (!g) return null;
    conds.push(inArray(parts.brandId, g.ids));
  }
  if (params.model) {
    const ids = await rangeIds(params.brand, params.model);
    if (!ids.length) return null;
    conds.push(inArray(parts.rangeId, ids));
    if (params.phase || params.year) {
      const phases = await phasesForRanges(ids.sort((a, b) => a - b).join(","));
      const selected = params.phase ? phases.filter((p) => p.slug === params.phase) : phasesForYear(phases, params.year!);
      if (!selected.length) return null;
      conds.push(inArray(parts.modelId, selected.flatMap((p) => p.ids)));
    }
  }
  if (params.doors) conds.push(eq(parts.doors, params.doors));
  if (params.vehicleId) conds.push(eq(parts.vehicleId, params.vehicleId));
  if (params.name) conds.push(sql`lower(${parts.name}) like ${`%${escapeLike(normalize(params.name))}%`}`);
  if (params.ref) {
    const ref = normalize(params.ref).replace(/[^a-z0-9]/g, "");
    if (ref) {
      conds.push(
        sql`regexp_replace(lower(coalesce(${parts.manufacturerReference}, '') || ' ' || coalesce(${parts.adaptableReference}, '')), '[^a-z0-9 ]', '', 'g') like ${`%${escapeLike(ref)}%`}`,
      );
    }
  }
  if (params.q) {
    const words = normalize(params.q).split(/\s+/).filter(Boolean).slice(0, 8);
    for (const w of words) conds.push(sql`${parts.searchText} like ${`%${escapeLike(w)}%`}`);
  }
  return conds;
}

export async function searchParts(params: PartSearch = {}): Promise<Paginated<Part>> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(48, Math.max(1, params.perPage ?? PER_PAGE));
  const conds = await buildConditions(params);
  if (!conds) return EMPTY(page, perPage);
  const where = and(...conds);
  const db = await getDb();

  const order =
    params.sort === "price-asc"
      ? [asc(parts.priceTtc), desc(parts.id)]
      : params.sort === "price-desc"
        ? [desc(parts.priceTtc), desc(parts.id)]
        : [sql`${parts.opistoCreatedAt} desc nulls last`, desc(parts.id)];

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(parts).where(where),
    db
      .select()
      .from(parts)
      .where(where)
      .orderBy(...order)
      .limit(perPage)
      .offset((page - 1) * perPage),
  ]);
  const totalN = Number(total);
  return { items: rows.map(toPart), total: totalN, page, perPage, pages: Math.max(1, Math.ceil(totalN / perPage)) };
}

export async function getLatestParts(limit = 8): Promise<Part[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(parts)
    .where(and(LIVE, HAS_PHOTO))
    .orderBy(sql`${parts.opistoCreatedAt} desc nulls last`, desc(parts.id))
    .limit(limit);
  return rows.map(toPart);
}

/** Sous-catégories à privilégier pour illustrer chaque famille (minuscules, ordre de préférence). */
const SHOWCASE_PREFERENCES: Record<string, string[]> = {
  "carrosserie-exterieure": ["porte avant gauche", "porte avant droit", "pare-chocs avant", "capot", "hayon", "aile avant gauche", "aile avant droit", "retroviseur gauche"],
  "carrosserie-interieure-et-divers": ["siege avant gauche", "siege avant droit", "volant", "compteur", "planche de bord complete", "banquette arriere"],
  "grosse-mecanique": ["moteur", "boite de vitesses", "turbo", "culasse", "pont arriere"],
  "petite-mecanique": ["alternateur", "demarreur", "compresseur de climatisation", "cremaillere assistee", "radiateur", "pompe a injection"],
  electricite: ["calculateur moteur", "boitier de servitude", "autoradio", "phare avant gauche"],
  jantes: ["jante alu", "jante", "jante tole"],
  pneus: ["pneu"],
};

/** Une photo de pièce réelle pour illustrer chaque famille, indexée par identifiant de famille. */
export async function getCategoryShowcase(): Promise<Record<number, { photo: string; name: string }>> {
  const db = await getDb();
  const families = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const out: Record<number, { photo: string; name: string }> = {};
  await Promise.all(
    families.map(async (f) => {
      const prefs = SHOWCASE_PREFERENCES[f.slug] ?? [];
      // Sous-catégories préférées d'abord, puis la pièce la plus récente.
      const order: SQL[] = [sql`${parts.opistoCreatedAt} desc nulls last`, desc(parts.id)];
      if (prefs.length) order.unshift(sql`array_position(array[${sql.join(prefs.map((n) => sql`${n}`), sql`, `)}]::text[], lower(${parts.subCategoryName})) asc nulls last`);
      const [row] = await db
        .select({ photo: sql<string>`${parts.photos}->>0`, name: parts.name })
        .from(parts)
        .where(and(LIVE, HAS_PHOTO, eq(parts.categoryId, f.id)))
        .orderBy(...order)
        .limit(1);
      if (row?.photo) out[f.id] = { photo: row.photo, name: row.name };
    }),
  );
  return out;
}

export async function getPart(id: number): Promise<Part | null> {
  const db = await getDb();
  const [row] = await db.select().from(parts).where(eq(parts.id, id)).limit(1);
  return row ? toPart(row) : null;
}

export async function getRelatedParts(part: Part, limit = 4): Promise<Part[]> {
  const db = await getDb();
  const out: PartRow[] = [];
  if (part.vehicleId) {
    out.push(
      ...(await db
        .select()
        .from(parts)
        .where(and(LIVE, ne(parts.id, part.id), eq(parts.vehicleId, part.vehicleId)))
        .orderBy(desc(parts.opistoCreatedAt))
        .limit(limit)),
    );
  }
  if (out.length < limit) {
    const seen = [part.id, ...out.map((p) => p.id)];
    out.push(
      ...(await db
        .select()
        .from(parts)
        .where(and(LIVE, sql`${parts.id} not in (${sql.join(seen.map((id) => sql`${id}`), sql`, `)})`, eq(parts.name, part.name)))
        .orderBy(desc(parts.opistoCreatedAt))
        .limit(limit - out.length)),
    );
  }
  return out.map(toPart);
}

/** Adresses de toutes les pièces en stock (plan du site). */
export async function listPartLinks(): Promise<{ id: number; slug: string; updatedAt: string }[]> {
  const db = await getDb();
  const rows = await db
    .select({ id: parts.id, slug: parts.slug, updatedAt: parts.opistoUpdatedAt, syncedAt: parts.syncedAt })
    .from(parts)
    .where(LIVE)
    .orderBy(desc(parts.opistoCreatedAt))
    .limit(45_000);
  return rows.map((r) => ({ id: r.id, slug: r.slug, updatedAt: (r.updatedAt ?? r.syncedAt).toISOString() }));
}

/* ---------- véhicules ---------- */

/**
 * Véhicule complet à vendre : publié à la vente par Opisto (/vehicles) avec
 * le statut « A vendre VO ». Les véhicules donneurs de pièces sont exclus.
 */
const VEHICLE_FOR_SALE = and(
  eq(vehicles.forSale, true),
  sql`lower(translate(coalesce(${vehicles.status}, ''), 'ÀÂÄàâä', 'AAAaaa')) like 'a vendre vo%'`,
)!;

export async function getVehicles(params: { page?: number; perPage?: number; brand?: string; forSale?: boolean } = {}): Promise<Paginated<Vehicle>> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(48, Math.max(1, params.perPage ?? PER_PAGE));
  const conds: SQL[] = [isNull(vehicles.deletedAt)];
  if (params.forSale === false) conds.push(eq(vehicles.forSale, false));
  else conds.push(VEHICLE_FOR_SALE);
  if (params.brand) {
    const g = (await brandGroups()).get(params.brand);
    if (!g) return { items: [], total: 0, page, perPage, pages: 1 };
    conds.push(inArray(vehicles.brandId, g.ids));
  }
  const where = and(...conds);
  const db = await getDb();
  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(vehicles).where(where),
    db
      .select()
      .from(vehicles)
      .where(where)
      .orderBy(desc(vehicles.forSale), sql`${vehicles.firstRegistration} desc nulls last`, desc(vehicles.id))
      .limit(perPage)
      .offset((page - 1) * perPage),
  ]);
  const totalN = Number(total);
  return { items: rows.map(toVehicle), total: totalN, page, perPage, pages: Math.max(1, Math.ceil(totalN / perPage)) };
}

export async function getVehicle(id: number): Promise<Vehicle | null> {
  const db = await getDb();
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return row ? toVehicle(row) : null;
}

/** Marques et sous-catégories dont le nom contient le texte saisi (recherche instantanée). */
export async function suggest(q: string): Promise<{ brands: Brand[]; models: (VehicleModel & { brandSlug: string; brandName: string })[]; categories: Category[] }> {
  const term = normalize(q).trim();
  if (term.length < 2) return { brands: [], models: [], categories: [] };
  const like = `%${escapeLike(term)}%`;
  const db = await getDb();
  const [groups, subs, rangeRows] = await Promise.all([
    brandGroups(),
    db
      .select()
      .from(subcategories)
      .where(and(sql`lower(${subcategories.name}) like ${like}`, sql`exists (select 1 from ${parts} where ${parts.subCategoryId} = ${subcategories.id} and ${LIVE})`))
      .orderBy(asc(subcategories.name))
      .limit(4),
    db
      .select({ range: ranges, brandName: brands.name, brandSlug: brands.slug })
      .from(ranges)
      .innerJoin(brands, eq(brands.id, ranges.brandId))
      .where(and(sql`lower(${ranges.name}) like ${like}`, sql`exists (select 1 from ${parts} where ${parts.rangeId} = ${ranges.id} and ${LIVE})`))
      .orderBy(asc(ranges.name), asc(ranges.id))
      .limit(6),
  ]);
  const brandsFound = [...groups.entries()]
    .filter(([slug, g]) => slug.includes(term.replace(/[^a-z0-9]+/g, "-")) || normalize(g.name).includes(term))
    .slice(0, 3)
    .map(([slug, g]) => ({ id: g.id, slug, name: g.name }));
  // Un modèle par libellé (les gammes en doublon chez Opisto sont regroupées)
  const seen = new Set<string>();
  const models = rangeRows
    .filter((r) => (seen.has(`${r.brandSlug}/${r.range.slug}`) ? false : (seen.add(`${r.brandSlug}/${r.range.slug}`), true)))
    .slice(0, 4)
    .map((r) => ({ ...toModel(r.range), brandSlug: r.brandSlug, brandName: r.brandName }));
  return { brands: brandsFound, models, categories: subs.map(toSubCategory) };
}
