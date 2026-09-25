/**
 * Accès aux données du catalogue.
 *
 * Deux sources interchangeables :
 * - `db.ts` : base Postgres synchronisée depuis Opisto (par défaut).
 * - `demo.ts` : jeu de démonstration en mémoire, si CATALOG_SOURCE=demo ou
 *   si le site tourne sur Vercel sans DATABASE_URL.
 * Les pages consomment ces fonctions sans rien savoir de la source. Les
 * composants client importent uniquement `./links` et `./types`.
 */
import * as db from "./db";
import * as demo from "./demo";

export type { Brand, Category, Paginated, Part, PartSearch, PartSort, Vehicle, VehicleModel } from "./types";
export { PER_PAGE, partHref, vehicleHref, vehicleLabel } from "./links";

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

/** Faux en développement sur PGlite : le rendu statique à la construction est alors désactivé pour le catalogue. */
export function canPrerenderCatalog(): boolean {
  return catalogSource() === "demo" || Boolean(process.env.DATABASE_URL);
}

const impl = () => (catalogSource() === "demo" ? demo : db);

export const getCategories: typeof db.getCategories = (...a) => impl().getCategories(...a);
export const getCategoryBySlug: typeof db.getCategoryBySlug = (...a) => impl().getCategoryBySlug(...a);
export const getBrands: typeof db.getBrands = (...a) => impl().getBrands(...a);
export const getBrandBySlug: typeof db.getBrandBySlug = (...a) => impl().getBrandBySlug(...a);
export const getModels: typeof db.getModels = (...a) => impl().getModels(...a);
export const getBrandCounts: typeof db.getBrandCounts = (...a) => impl().getBrandCounts(...a);
export const getCategoryCounts: typeof db.getCategoryCounts = (...a) => impl().getCategoryCounts(...a);
export const searchParts: typeof db.searchParts = (...a) => impl().searchParts(...a);
export const getLatestParts: typeof db.getLatestParts = (...a) => impl().getLatestParts(...a);
export const getPart: typeof db.getPart = (...a) => impl().getPart(...a);
export const getRelatedParts: typeof db.getRelatedParts = (...a) => impl().getRelatedParts(...a);
export const listPartLinks: typeof db.listPartLinks = (...a) => impl().listPartLinks(...a);
export const getVehicles: typeof db.getVehicles = (...a) => impl().getVehicles(...a);
export const getVehicle: typeof db.getVehicle = (...a) => impl().getVehicle(...a);
