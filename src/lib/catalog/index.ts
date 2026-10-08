/**
 * Accès aux données du catalogue.
 *
 * Deux sources interchangeables :
 * - `db.ts` : base Postgres synchronisée depuis Opisto (par défaut).
 * - `demo.ts` : jeu de démonstration en mémoire, si CATALOG_SOURCE=demo ou
 *   si le site tourne sur Vercel sans DATABASE_URL.
 * Les pages consomment ces fonctions sans rien savoir de la source. Les
 * composants client importent uniquement `./links` et `./types`.
 *
 * Cache de données : chaque visite (robots compris) réveillait la base Neon,
 * qui ne se mettait jamais en veille (≈ 7 h de calcul par jour). Les lectures
 * sont donc gardées dans le cache de données de Vercel :
 * - étiquette `catalog` (listes, compteurs, filtres) : vidée après chaque
 *   synchronisation qui a changé le stock (voir /api/sync) ;
 * - étiquette `part-{id}` (fiche produit) : vidée pour la seule pièce modifiée
 *   ou vendue, les 20 000 autres fiches restent en cache.
 * Le panier et le paiement lisent la base en direct (`getPartFresh`).
 */
import { unstable_cache } from "next/cache";
import * as db from "./db";
import * as demo from "./demo";

export type { Brand, Category, DoorOption, Paginated, Part, PartSearch, PartSort, Vehicle, VehicleModel, VehiclePhase } from "./types";
export { MODEL_PAGE_MIN_PARTS, PER_PAGE, modelHref, partHref, vehicleHref, vehicleLabel } from "./links";

export type CatalogSource = "db" | "demo";

export function catalogSource(): CatalogSource {
  if (process.env.CATALOG_SOURCE === "demo") return "demo";
  if (process.env.CATALOG_SOURCE === "db") return "db";
  if (process.env.VERCEL && !process.env.DATABASE_URL) return "demo";
  return "db";
}

/** Vrai tant que les données affichées sont le jeu de démonstration. */
export function isDemoData(): boolean {
  return catalogSource() === "demo";
}

const impl = () => (catalogSource() === "demo" ? demo : db);

/** Étiquettes du cache de données, vidées par /api/sync. */
export const CATALOG_TAG = "catalog";
export const VEHICLES_TAG = "vehicles";
export const partTag = (id: number) => `part-${id}`;

const HOUR = 3600;

type AsyncFn = (...args: never[]) => Promise<unknown>;

/** Lecture mise en cache (base de données uniquement ; le jeu de démonstration est lu tel quel). */
function cached<F extends AsyncFn>(name: string, dbFn: F, demoFn: F, options: { tags: string[]; revalidate: number }): F {
  const fromCache = unstable_cache(dbFn as unknown as (...args: unknown[]) => Promise<unknown>, ["catalog", name], options);
  return ((...args: Parameters<F>) => (catalogSource() === "demo" ? demoFn(...args) : fromCache(...args))) as F;
}

/** Données du catalogue : rafraîchies à chaque synchronisation (au plus 6 h sans changement). */
const catalog = <F extends AsyncFn>(name: string, dbFn: F, demoFn: F) => cached(name, dbFn, demoFn, { tags: [CATALOG_TAG], revalidate: 6 * HOUR });

export const getCategories = catalog("getCategories", db.getCategories, demo.getCategories);
export const getCategoryBySlug = catalog("getCategoryBySlug", db.getCategoryBySlug, demo.getCategoryBySlug);
export const getBrands = catalog("getBrands", db.getBrands, demo.getBrands);
export const getBrandBySlug = catalog("getBrandBySlug", db.getBrandBySlug, demo.getBrandBySlug);
export const getModels = catalog("getModels", db.getModels, demo.getModels);
export const getModelsWithCounts = catalog("getModelsWithCounts", db.getModelsWithCounts, demo.getModelsWithCounts);
export const getCategoryFacets = catalog("getCategoryFacets", db.getCategoryFacets, demo.getCategoryFacets);
export const listModelLinks = catalog("listModelLinks", db.listModelLinks, demo.listModelLinks);
export const getPhases = catalog("getPhases", db.getPhases, demo.getPhases);
export const getDoorOptions = catalog("getDoorOptions", db.getDoorOptions, demo.getDoorOptions);
export const getBrandCounts = catalog("getBrandCounts", db.getBrandCounts, demo.getBrandCounts);
export const getCategoryCounts = catalog("getCategoryCounts", db.getCategoryCounts, demo.getCategoryCounts);
export const searchParts = catalog("searchParts", db.searchParts, demo.searchParts);
export const getLatestParts = catalog("getLatestParts", db.getLatestParts, demo.getLatestParts);
export const getCategoryShowcase = catalog("getCategoryShowcase", db.getCategoryShowcase, demo.getCategoryShowcase);
export const suggest = catalog("suggest", db.suggest, demo.suggest);
export const getVehicles = cached("getVehicles", db.getVehicles, demo.getVehicles, { tags: [CATALOG_TAG, VEHICLES_TAG], revalidate: 6 * HOUR });
export const getVehicle = cached("getVehicle", db.getVehicle, demo.getVehicle, { tags: [VEHICLES_TAG], revalidate: 6 * HOUR });

/** Fiche produit : en cache 24 h, vidée dès que la pièce change ou est vendue (étiquette propre à la pièce). */
export const getPart: typeof db.getPart = (id) =>
  catalogSource() === "demo" ? demo.getPart(id) : unstable_cache(() => db.getPart(id), ["catalog", "getPart", String(id)], { tags: [partTag(id)], revalidate: 24 * HOUR })();

export const getPartModel: typeof db.getPartModel = (id) =>
  catalogSource() === "demo" ? demo.getPartModel(id) : unstable_cache(() => db.getPartModel(id), ["catalog", "getPartModel", String(id)], { tags: [partTag(id)], revalidate: 24 * HOUR })();

/** Pièces associées d'une fiche : en cache 6 h (une pièce vendue entre-temps mène à la page « plus en rayon »). */
export const getRelatedParts: typeof db.getRelatedParts = (part, limit) =>
  catalogSource() === "demo"
    ? demo.getRelatedParts(part, limit)
    : unstable_cache(() => db.getRelatedParts(part, limit), ["catalog", "getRelatedParts", String(part.id), String(part.vehicleId), part.name, String(limit ?? 4)], {
        tags: ["related"],
        revalidate: 6 * HOUR,
      })();

/** Liste des 20 000 fiches (plan du site) : trop volumineuse pour le cache de données, le plan du site est lui-même mis en cache 12 h. */
export const listPartLinks: typeof db.listPartLinks = (...a) => impl().listPartLinks(...a);

/** Adresses des fiches à vider après une synchronisation (lecture directe). */
export const getPartPaths: typeof db.getPartPaths = (...a) => impl().getPartPaths(...a);

/** Lecture directe, sans cache : disponibilité au moment du panier et du paiement. */
export const getPartFresh: typeof db.getPart = (...a) => impl().getPart(...a);
