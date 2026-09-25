/**
 * Source « démonstration » du catalogue : jeu de données en mémoire
 * (`mock.ts`), utilisé quand CATALOG_SOURCE=demo ou qu'aucune base n'est
 * configurée sur Vercel. Même interface que `db.ts`.
 */
import { slugify } from "@/lib/slug";
import { DEMO_BRANDS, DEMO_CATEGORIES, DEMO_MODELS, DEMO_PARTS, DEMO_VEHICLES } from "./mock";
import type { Brand, Category, Paginated, Part, PartSearch, Vehicle, VehicleModel } from "./types";
import { PER_PAGE } from "./links";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export async function getCategories(): Promise<Category[]> {
  return DEMO_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return DEMO_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  return [...DEMO_BRANDS].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return DEMO_BRANDS.find((b) => b.slug === slug) ?? null;
}

export async function getModels(brandId: number): Promise<VehicleModel[]> {
  return DEMO_MODELS.filter((m) => m.brandId === brandId);
}

/** Nombre de pièces disponibles par marque, pour l'index des marques. */
export async function getBrandCounts(): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  for (const p of DEMO_PARTS) {
    if (p.brandId && p.available) counts[p.brandId] = (counts[p.brandId] ?? 0) + 1;
  }
  return counts;
}

/** Nombre de pièces disponibles par catégorie. */
export async function getCategoryCounts(): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};
  for (const p of DEMO_PARTS) {
    if (p.available) counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
  }
  return counts;
}

export async function searchParts(params: PartSearch = {}): Promise<Paginated<Part>> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(48, Math.max(1, params.perPage ?? PER_PAGE));
  let items = DEMO_PARTS.filter((p) => p.available && p.inStock);

  if (params.category) items = items.filter((p) => slugify(p.categoryName) === params.category);
  if (params.brand) items = items.filter((p) => p.brandName && slugify(p.brandName) === params.brand);
  if (params.model) items = items.filter((p) => p.modelName && slugify(p.modelName) === params.model);
  if (params.vehicleId) items = items.filter((p) => p.vehicleId === params.vehicleId);
  if (params.ref) {
    const ref = normalize(params.ref).replace(/[^a-z0-9]/g, "");
    items = items.filter((p) =>
      [p.manufacturerReference, p.adaptableReference].some((r) => r && normalize(r).replace(/[^a-z0-9]/g, "").includes(ref)),
    );
  }
  if (params.q) {
    const words = normalize(params.q).split(/\s+/).filter(Boolean);
    items = items.filter((p) => {
      const hay = normalize([p.name, p.brandName, p.modelName, p.categoryName, p.manufacturerReference].filter(Boolean).join(" "));
      return words.every((w) => hay.includes(w));
    });
  }

  switch (params.sort) {
    case "price-asc":
      items.sort((a, b) => a.priceTtc - b.priceTtc);
      break;
    case "price-desc":
      items.sort((a, b) => b.priceTtc - a.priceTtc);
      break;
    default:
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  return { items: items.slice((page - 1) * perPage, page * perPage), total, page, perPage, pages };
}

export async function getLatestParts(limit = 8): Promise<Part[]> {
  return (await searchParts({ sort: "recent", perPage: limit })).items;
}

export async function getPart(id: number): Promise<Part | null> {
  return DEMO_PARTS.find((p) => p.id === id) ?? null;
}

/** Autres pièces du même véhicule, puis de la même catégorie. */
export async function getRelatedParts(part: Part, limit = 4): Promise<Part[]> {
  const sameVehicle = DEMO_PARTS.filter((p) => p.id !== part.id && p.vehicleId && p.vehicleId === part.vehicleId);
  const sameCategory = DEMO_PARTS.filter((p) => p.id !== part.id && p.categoryId === part.categoryId && !sameVehicle.includes(p));
  return [...sameVehicle, ...sameCategory].slice(0, limit);
}

export async function getVehicles(params: { page?: number; perPage?: number; brand?: string; forSale?: boolean } = {}): Promise<Paginated<Vehicle>> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = params.perPage ?? PER_PAGE;
  let items = [...DEMO_VEHICLES];
  if (params.brand) items = items.filter((v) => slugify(v.brandName) === params.brand);
  if (params.forSale !== undefined) items = items.filter((v) => v.forSale === params.forSale);
  items.sort((a, b) => (b.firstRegistration ?? "").localeCompare(a.firstRegistration ?? ""));
  const total = items.length;
  return { items: items.slice((page - 1) * perPage, page * perPage), total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getVehicle(id: number): Promise<Vehicle | null> {
  return DEMO_VEHICLES.find((v) => v.id === id) ?? null;
}

/** Adresses de toutes les pièces en stock (plan du site). */
export async function listPartLinks(): Promise<{ id: number; slug: string; updatedAt: string }[]> {
  return DEMO_PARTS.filter((p) => p.available && p.inStock).map((p) => ({ id: p.id, slug: p.slug, updatedAt: p.updatedAt }));
}

/** Une photo de pièce par catégorie (jeu de démonstration). */
export async function getCategoryShowcase(): Promise<Record<number, { photo: string; name: string }>> {
  const out: Record<number, { photo: string; name: string }> = {};
  for (const p of DEMO_PARTS) {
    if (p.available && p.photos[0] && !out[p.categoryId]) out[p.categoryId] = { photo: p.photos[0], name: p.name };
  }
  return out;
}
