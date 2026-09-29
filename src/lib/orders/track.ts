import "server-only";
import type { OrderItem, OrderRow } from "@/db/schema";
import { casseId, getOrder, getOrderInvoiceUrl } from "@/lib/opisto/client";
import { fromOpistoDate } from "@/lib/opisto/dates";
import { cleanLabel, isRealPhoto, titleCase } from "@/lib/opisto/mapper";
import type { OpistoOrder } from "@/lib/opisto/types";
import { getOrderByOpistoId, getOrderByRef, orderNumber } from "./checkout";

/** Étape affichée au client. */
export type TrackStage = "pending" | "paid" | "preparing" | "ready" | "shipped" | "returned" | "cancelled";

export type TrackedOrder = {
  /** Numéro de transaction Opisto, ou référence du site si la commande n'y est pas enregistrée */
  ref: string;
  /** Commande passée sur le site, ou ailleurs (comptoir, téléphone, plateformes) et lue dans Opisto */
  source: "site" | "opisto";
  createdAt: string;
  paidAt: string | null;
  stage: TrackStage;
  deliveryMode: "pickup" | "shipping";
  items: (Pick<OrderItem, "id" | "name" | "brandName" | "modelName" | "reference" | "priceTtc" | "photo">)[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryTo: { name: string; postcode: string; city: string } | null;
  tracking: { transporter: string | null; number: string } | null;
  delay: { min: number; max: number } | null;
  invoiceUrl: string | null;
};

/**
 * État de livraison Opisto (DeliveryInfos.Status), dans l'ordre de l'écran
 * Opisto 360 : 1 à préparer, 2 préparée, 3 expédiée, 4 retournée, 5 annulée.
 */
const SHIPPING_STATUS = { SHIPPED: 3, RETURNED: 4, CANCELLED: 5 } as const;
/** OrderStatus Opisto : 4 = devis, 5 = facture. */
const ORDER_STATUS = { QUOTE: 4, INVOICE: 5 } as const;

const EMPTY_VALUES = new Set(["", "non renseigné", "non renseigne", "null"]);
const clean = (v: string | null | undefined) => (v && !EMPTY_VALUES.has(v.trim().toLowerCase()) ? v.trim() : null);
const sameEmail = (a: string | null | undefined, b: string) => Boolean(a) && a!.trim().toLowerCase() === b.trim().toLowerCase();

/** Lecture Opisto sans faire échouer le suivi. */
async function readRemote(opistoOrderId: number, label: string): Promise<OpistoOrder | null> {
  try {
    return await getOrder(opistoOrderId);
  } catch (err) {
    console.warn(`[suivi ${label}] lecture Opisto impossible :`, err instanceof Error ? err.message : err);
    return null;
  }
}

/** Étape de livraison lue dans Opisto, prioritaire sur l'état connu du site. */
function remoteStage(remote: OpistoOrder | null, ship: boolean): TrackStage | null {
  const status = remote?.DeliveryInfos?.Status;
  if (status === SHIPPING_STATUS.CANCELLED) return "cancelled";
  if (status === SHIPPING_STATUS.RETURNED) return "returned";
  if (ship && (status === SHIPPING_STATUS.SHIPPED || clean(remote?.DeliveryInfos?.DeliveryNumber))) return "shipped";
  return null;
}

async function remoteExtras(remote: OpistoOrder | null, ship: boolean) {
  const number = clean(remote?.DeliveryInfos?.DeliveryNumber);
  return {
    tracking: ship && number ? { number, transporter: clean(remote?.DeliveryInfos?.Transporter) } : null,
    delay: ship && remote?.Shipping?.DelayMax ? { min: remote.Shipping.DelayMin ?? 1, max: remote.Shipping.DelayMax } : null,
    invoiceUrl: remote?.HasInvoice ? await getOrderInvoiceUrl(remote.Id) : null,
  };
}

/** Commande passée sur le site, complétée par Opisto (colis, facture). */
async function trackSiteOrder(order: OrderRow): Promise<TrackedOrder> {
  const ship = order.deliveryMode === "shipping";
  const remote = order.opistoOrderId ? await readRemote(order.opistoOrderId, order.ref) : null;
  const local: TrackStage =
    order.status === "pending" ? "pending" : order.status === "cancelled" ? "cancelled" : order.status === "paid" ? "paid" : ship ? "preparing" : "ready";
  const stage = local === "pending" || local === "cancelled" ? local : (remoteStage(remote, ship) ?? local);
  const to = ship ? (order.delivery ?? order.billing) : null;
  return {
    ref: orderNumber(order),
    source: "site",
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    stage,
    deliveryMode: ship ? "shipping" : "pickup",
    items: order.items.map(({ id, name, brandName, modelName, reference, priceTtc, photo }) => ({ id, name, brandName, modelName, reference, priceTtc, photo })),
    subtotal: Number(order.subtotalTtc),
    shipping: Number(order.shippingTtc),
    total: Number(order.totalTtc),
    deliveryTo: to ? { name: `${to.firstname} ${to.lastname}`, postcode: to.postcode, city: to.city } : null,
    ...(await remoteExtras(remote, ship)),
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Commande passée hors du site (comptoir, téléphone, plateformes), lue
 * directement dans Opisto. L'e-mail doit être celui du client de la
 * commande, et la commande doit appartenir à Cazenave.
 */
async function trackOpistoOrder(opistoOrderId: number, email: string): Promise<TrackedOrder | null> {
  const remote = await readRemote(opistoOrderId, String(opistoOrderId));
  if (!remote?.Id || remote.Casse?.Id !== casseId()) return null;
  if (!sameEmail(remote.Client?.Contact?.Mail, email) && !sameEmail(remote.Client?.Identity?.Email, email)) return null;

  const ship = Boolean(remote.WantSend);
  const total = remote.Total ?? 0;
  const paid = remote.Status === ORDER_STATUS.INVOICE || (remote.Payment?.Amount ?? 0) >= total - 0.01;
  const stage: TrackStage = remote.Status === ORDER_STATUS.QUOTE || !paid ? "pending" : (remoteStage(remote, ship) ?? (ship ? "preparing" : "ready"));
  const items = (remote.Parts ?? []).map((p) => {
    const id = p.Vehicle?.Identification;
    const ht = (p.Price?.OriginPrice ?? 0) - (p.Price?.ReductionExcludingTaxes ?? 0);
    const photo = (p.ScaledPhotos ?? []).map((s) => s.UrlMediumPhoto || s.Url).find(isRealPhoto) ?? null;
    return {
      id: p.Id,
      name: cleanLabel(p.Category?.Name) ?? "Pièce",
      brandName: titleCase(cleanLabel(id?.Brand?.Name)),
      modelName: titleCase(cleanLabel(id?.Model?.Name ?? id?.Range?.Name)),
      reference: cleanLabel(p.ManufacturerReference),
      priceTtc: round2(ht * (1 + (p.Price?.VATRate ?? 20) / 100)),
      photo,
    };
  });
  const shipping = ship ? (remote.Shipping?.CalculatedTotalCost ?? 0) : 0;
  const to = ship ? remote.DeliveryAddress : null;
  return {
    ref: String(remote.Id),
    source: "opisto",
    createdAt: (fromOpistoDate(remote.Date ?? null) ?? new Date()).toISOString(),
    paidAt: paid ? (fromOpistoDate(remote.Payment?.Date ?? null)?.toISOString() ?? null) : null,
    stage,
    deliveryMode: ship ? "shipping" : "pickup",
    items,
    subtotal: remote.PartsTotalIncludingTaxes ?? round2(total - shipping),
    shipping,
    total,
    deliveryTo: to ? { name: [to.Firstname, to.Lastname].filter(Boolean).join(" "), postcode: to.PostCode ?? "", city: to.City ?? "" } : null,
    ...(await remoteExtras(remote, ship)),
  };
}

/**
 * Suivi de commande : numéro de transaction Opisto (ou ancienne référence
 * CZ-… du site) et e-mail de la commande.
 */
export async function trackOrder(input: string, email: string): Promise<TrackedOrder | null> {
  const key = input.trim().toUpperCase().replace(/\s+/g, "");
  if (/^\d{5,10}$/.test(key)) {
    const id = Number(key);
    const order = await getOrderByOpistoId(id);
    if (order) return sameEmail(order.email, email) ? trackSiteOrder(order) : null;
    return trackOpistoOrder(id, email);
  }
  const order = await getOrderByRef(key);
  return order && sameEmail(order.email, email) ? trackSiteOrder(order) : null;
}
