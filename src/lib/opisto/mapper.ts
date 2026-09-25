import { slugify } from "@/lib/slug";
import type { NewPartRow, NewVehicleRow } from "@/db/schema";
import { fromOpistoDate } from "./dates";
import type { OpistoPart, OpistoVehicle } from "./types";

/** Nettoie les libellés Opisto (capitales, espaces multiples). */
export function cleanLabel(value: string | undefined | null): string | null {
  if (!value) return null;
  const v = value.replace(/\s+/g, " ").trim();
  return v.length ? v : null;
}

/** « RANGE ROVER 3 » → « Range Rover 3 » ; sigles courts conservés. */
export function titleCase(value: string | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 3 && /^[a-z0-9]+$/.test(w) && !/^\d+$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

const money = (n: number | undefined | null) => (typeof n === "number" && Number.isFinite(n) ? n.toFixed(2) : null);

/** Photos grand format d'une pièce ou d'un véhicule (photos de la pièce d'abord). */
export function photoUrls(item: { ScaledPhotos?: OpistoPart["ScaledPhotos"]; Photos?: string[] }, size: "large" | "medium" = "large"): string[] {
  const scaled = item.ScaledPhotos ?? [];
  if (scaled.length) {
    const sorted = [...scaled].sort((a, b) => Number(b.IsPart) - Number(a.IsPart) || Number(b.IsThumbnail ?? false) - Number(a.IsThumbnail ?? false));
    return sorted.map((p) => (size === "large" ? p.UrlLargePhoto || p.Url : p.UrlMediumPhoto || p.Url)).filter(Boolean);
  }
  return (item.Photos ?? []).filter(Boolean);
}

/** Version courte : la désignation commerciale sans le nom du modèle qu'elle répète. */
export function shortVersion(id: { CommercialDesignation?: string; Finish?: string; Model?: { Name: string }; Range?: { Name: string } } | undefined): string | null {
  const raw = cleanLabel(id?.CommercialDesignation ?? id?.Finish);
  if (!raw) return null;
  let v = raw;
  for (const prefix of [id?.Model?.Name, id?.Range?.Name]) {
    const p = cleanLabel(prefix);
    if (p && v.toUpperCase().startsWith(p.toUpperCase())) v = v.slice(p.length).replace(/^[\s\-:]+/, "");
  }
  // Désignation identique au nom du modèle : rien à ajouter.
  return v.length ? v : null;
}

export function vehicleSlug(v: OpistoVehicle): string {
  const id = v.Identification;
  return slugify([id?.Brand?.Name, id?.Range?.Name ?? id?.Model?.Name, id?.CommercialDesignation].filter(Boolean).join(" ")) || `vehicule-${v.Id}`;
}

export function mapVehicle(v: OpistoVehicle, casse: number, now: Date): NewVehicleRow {
  const id = v.Identification;
  const year = v.Year ? Number(v.Year) : null;
  return {
    id: v.Id,
    casseId: v.Casse?.Id ?? casse,
    slug: vehicleSlug(v),
    brandId: id?.Brand?.Id ?? null,
    rangeId: id?.Range?.Id ?? null,
    modelId: id?.Model?.Id ?? null,
    identificationId: id?.Id ?? null,
    brandName: titleCase(cleanLabel(id?.Brand?.Name)),
    rangeName: titleCase(cleanLabel(id?.Range?.Name)),
    modelName: titleCase(cleanLabel(id?.Model?.Name)),
    version: shortVersion(id),
    energy: cleanLabel(id?.Energy?.Name),
    gearbox: cleanLabel(id?.GearboxType?.Name),
    engineCode: cleanLabel(id?.EngineCode),
    gearboxCode: cleanLabel(id?.GearboxCode),
    power: id?.Power ?? null,
    displacement: id?.Displacement ?? null,
    ktype: id?.KType ?? null,
    cnit: cleanLabel(id?.CNIT),
    typeMine: cleanLabel(v.TypeMine),
    vin: cleanLabel(v.VIN),
    year: year && Number.isFinite(year) ? year : null,
    mileage: typeof v.Mileage === "number" && v.Mileage > 0 ? v.Mileage : null,
    color: cleanLabel(v.Color?.Name),
    firstRegistration: fromOpistoDate(v.FirstRegistrationDateDto ?? v.DateFirstRegistration ?? null),
    forSale: Boolean(v.ForSale),
    status: cleanLabel(v.Status),
    expertPrice: money(v.ExpertPrice),
    photos: photoUrls(v),
    vignette: photoUrls(v, "medium")[0] || v.Vignette || null,
    policeId: v.PoliceId ?? null,
    deletedAt: null,
    syncedAt: now,
  };
}

export function mapPart(p: OpistoPart, casse: number, family: { id: number; name: string } | null, now: Date): NewPartRow {
  const v = p.Vehicle;
  const id = v?.Identification;
  const name = cleanLabel(p.Category?.Name) ?? "Pièce";
  const brand = titleCase(cleanLabel(id?.Brand?.Name));
  const range = titleCase(cleanLabel(id?.Range?.Name ?? id?.Model?.Name));
  const priceHt = p.Price?.OriginPrice ?? 0;
  const vatRate = p.Price?.VATRate ?? 20;
  const priceTtc = Math.round(priceHt * (1 + vatRate / 100) * 100) / 100;
  const shipping = p.Shipping;
  const photos = photoUrls(p);
  // Les pièces anciennes n'ont parfois pas de date de création : on retient la date de modification.
  const created = fromOpistoDate(p.CreationDateDto ?? p.CreationDate ?? null);
  const updated = fromOpistoDate(p.UpdateDateDto ?? p.UpdateDate ?? null);
  const year = v?.Year ? Number(v.Year) : null;
  const searchText = [name, brand, range, id?.Model?.Name, id?.CommercialDesignation, p.ManufacturerReference, p.AdaptableReference, id?.EngineCode, p.Description]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  return {
    id: p.Id,
    casseId: p.Casse?.Id ?? casse,
    slug: slugify([name, brand, range].filter(Boolean).join(" ")) || `piece-${p.Id}`,
    name,
    description: cleanLabel(p.Description),
    categoryId: family?.id ?? null,
    categoryName: family?.name ?? null,
    subCategoryId: p.Category?.Id ?? null,
    subCategoryName: name,
    condition: p.Condition ?? 0,
    manufacturerReference: cleanLabel(p.ManufacturerReference),
    adaptableReference: cleanLabel(p.AdaptableReference),
    manufacturerPrice: money(p.ManufacturerPrice),
    priceHt: priceHt.toFixed(4),
    vatRate: vatRate.toFixed(2),
    priceTtc: priceTtc.toFixed(2),
    quantity: p.Price?.Quantity ?? 1,
    warrantyMonths: p.Warranty ?? 0,
    weight: money(p.Weight),
    shippingAvailable: Boolean(shipping?.IsDeliveryAvailable),
    shippingId: shipping?.ShippingId ?? null,
    shippingCost: money(shipping?.Cost),
    shippingCostHt: money(shipping?.CostExcludingTaxes),
    shippingDelayMin: shipping?.DelayMin ?? null,
    shippingDelayMax: shipping?.DelayMax ?? null,
    shippings: p.Shippings ?? [],
    photos,
    photosMedium: photoUrls(p, "medium"),
    vignette: photoUrls(p, "medium")[0] || p.Vignette || null,
    available: p.Available !== false,
    inStock: p.IsInStock !== false,
    forSale: p.ForSale !== false,
    blocked: Boolean(p.Blocked),
    isInParc: p.IsInParc ?? null,
    availabilityStatus: p.AvailabilityStatus ?? null,
    canBePurchased: p.CanBePurchasedOnPlatform ?? null,
    locationAreaCode: cleanLabel(p.LocationSiteAreaCode),
    locationCity: titleCase(cleanLabel(p.LocationSiteCity)),
    vehicleId: v?.Id ?? null,
    brandId: id?.Brand?.Id ?? null,
    rangeId: id?.Range?.Id ?? null,
    modelId: id?.Model?.Id ?? null,
    brandName: brand,
    modelName: range,
    version: shortVersion(id),
    energy: cleanLabel(id?.Energy?.Name),
    gearbox: cleanLabel(id?.GearboxType?.Name),
    engineCode: cleanLabel(id?.EngineCode),
    gearboxCode: cleanLabel(id?.GearboxCode),
    ktype: id?.KType ?? null,
    mileage: typeof v?.Mileage === "number" && v.Mileage > 0 ? v.Mileage : null,
    color: cleanLabel(v?.Color?.Name),
    year: year && Number.isFinite(year) ? year : null,
    firstRegistration: fromOpistoDate(v?.FirstRegistrationDateDto ?? v?.DateFirstRegistration ?? null),
    characteristics: (p.Characteristics ?? []).filter((c) => c?.Key && c?.Value).map((c) => ({ key: c.Key, value: c.Value })),
    searchText,
    opistoCreatedAt: created ?? updated,
    opistoUpdatedAt: updated ?? created,
    deletedAt: fromOpistoDate(p.DeleteDateDto ?? p.DeleteDate ?? null),
    syncedAt: now,
  };
}
