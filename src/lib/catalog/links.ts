/**
 * Aides sans dépendance serveur (utilisables dans les composants client) :
 * adresses des fiches et libellés.
 */
import type { Part, Vehicle } from "./types";

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
