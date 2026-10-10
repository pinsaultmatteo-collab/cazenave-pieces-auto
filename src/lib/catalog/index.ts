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
 * Cache de données : seules les données communes à tout le catalogue
 * (familles, marques, modèles, compteurs, nouveautés, véhicules à vendre)
 * sont gardées dans le cache de Vercel, étiquette `catalog`, vidée après
 * chaque synchronisation qui change le stock (voir /api/sync). Elles sont
 * relues par presque toutes les pages.
 * Le reste (fiches, recherches, filtres d'une page modèle) est lu en direct :
 * les robots consultent chaque fiche une seule fois, et le mettre en cache
 * coûtait des écritures facturées par Vercel sans jamais resservir
 * (mesuré le 10 oct. 2026 : 0,4 lecture par écriture).
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

/** Étiquette du cache de données, vidée par /api/sync. */
export const CATALOG_TAG = "catalog";

type AsyncFn = (...args: never[]) => Promise<unknown>;

/** Lecture partagée mise en cache 6 h au plus (base de données uniquement ; le jeu de démonstration est lu tel quel). */
function shared<F extends AsyncFn>(name: string, dbFn: F, demoFn: F): F {
  const fromCache = unstable_cache(dbFn as unknown as (...args: unknown[]) => Promise<unknown>, ["catalog", name], { tags: [CATALOG_TAG], revalidate: 6 * 3600 });
  return ((...args: Parameters<F>) => (catalogSource() === "demo" ? demoFn(...args) : fromCache(...args))) as F;
}

/* Données communes, relues par presque toutes les pages : en cache. */
export const getCategories = shared("getCategories", db.getCategories, demo.getCategories);
export const getCategoryBySlug = shared("getCategoryBySlug", db.getCategoryBySlug, demo.getCategoryBySlug);
export const getBrands = shared("getBrands", db.getBrands, demo.getBrands);
export const getBrandBySlug = shared("getBrandBySlug", db.getBrandBySlug, demo.getBrandBySlug);
export const getModels = shared("getModels", db.getModels, demo.getModels);
export const getModelsWithCounts = shared("getModelsWithCounts", db.getModelsWithCounts, demo.getModelsWithCounts);
export const listModelLinks = shared("listModelLinks", db.listModelLinks, demo.listModelLinks);
export const getBrandCounts = shared("getBrandCounts", db.getBrandCounts, demo.getBrandCounts);
export const getCategoryCounts = shared("getCategoryCounts", db.getCategoryCounts, demo.getCategoryCounts);
export const getLatestParts = shared("getLatestParts", db.getLatestParts, demo.getLatestParts);
export const getCategoryShowcase = shared("getCategoryShowcase", db.getCategoryShowcase, demo.getCategoryShowcase);
export const getVehicles = shared("getVehicles", db.getVehicles, demo.getVehicles);

/* Lectures propres à une page (fiche, recherche, filtres) : en direct. */
export const getCategoryFacets: typeof db.getCategoryFacets = (...a) => impl().getCategoryFacets(...a);
export const getPhases: typeof db.getPhases = (...a) => impl().getPhases(...a);
export const getDoorOptions: typeof db.getDoorOptions = (...a) => impl().getDoorOptions(...a);
export const searchParts: typeof db.searchParts = (...a) => impl().searchParts(...a);
export const suggest: typeof db.suggest = (...a) => impl().suggest(...a);
export const getPart: typeof db.getPart = (...a) => impl().getPart(...a);
export const getPartModel: typeof db.getPartModel = (...a) => impl().getPartModel(...a);
export const getRelatedParts: typeof db.getRelatedParts = (...a) => impl().getRelatedParts(...a);
export const getVehicle: typeof db.getVehicle = (...a) => impl().getVehicle(...a);
export const listPartLinks: typeof db.listPartLinks = (...a) => impl().listPartLinks(...a);
