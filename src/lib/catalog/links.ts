/**
 * Aides sans dépendance serveur (utilisables dans les composants client) :
 * adresses des fiches et libellés.
 */
import type { Part, Vehicle } from "./types";

/** En dessous de ce nombre de pièces, une page modèle n'est pas indexée (contenu trop mince). */
export const MODEL_PAGE_MIN_PARTS = 5;

/** Page « Pièces {marque} {modèle} d'occasion ». */
export function modelHref(brandSlug: string, modelSlug: string): string {
  return `/pieces-auto/marques/${brandSlug}/${modelSlug}`;
}

export const PER_PAGE = 12;

export function partHref(part: Pick<Part, "id" | "slug">): string {
  return `/piece/${part.id}-${part.slug}`;
}

export function vehicleHref(vehicle: Pick<Vehicle, "id" | "slug">): string {
  return `/vehicule-occasion/${vehicle.id}/${vehicle.slug}`;
}

export function vehicleLabel(v: Pick<Vehicle, "brandName" | "modelName" | "version">): string {
  return [v.brandName, v.modelName, v.version].filter(Boolean).join(" ");
}
