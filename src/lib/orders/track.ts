import "server-only";
import type { OrderItem } from "@/db/schema";
import { getOrder, getOrderInvoiceUrl } from "@/lib/opisto/client";
import { getOrderByRef } from "./checkout";

/** Étape affichée au client. */
export type TrackStage = "pending" | "paid" | "preparing" | "ready" | "shipped" | "cancelled";

export type TrackedOrder = {
  ref: string;
  createdAt: string;
  paidAt: string | null;
  stage: TrackStage;
  deliveryMode: "pickup" | "shipping";
  items: Pick<OrderItem, "id" | "name" | "brandName" | "modelName" | "reference" | "priceTtc" | "photo" | "href">[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryTo: { name: string; postcode: string; city: string } | null;
  tracking: { transporter: string | null; number: string } | null;
  delay: { min: number; max: number } | null;
  invoiceUrl: string | null;
};

const EMPTY_VALUES = new Set(["", "non renseigné", "non renseigne", "null"]);
const clean = (v: string | null | undefined) => (v && !EMPTY_VALUES.has(v.trim().toLowerCase()) ? v.trim() : null);

/**
 * Suivi d'une commande du site : la référence et l'e-mail doivent
 * correspondre. Complété par Opisto (transporteur, n° de colis, facture)
 * quand la commande y est enregistrée.
 */
export async function trackOrder(ref: string, email: string): Promise<TrackedOrder | null> {
  const order = await getOrderByRef(ref.trim().toUpperCase());
  if (!order || order.email.toLowerCase() !== email.trim().toLowerCase()) return null;

  const ship = order.deliveryMode === "shipping";
  let stage: TrackStage =
    order.status === "pending" ? "pending" : order.status === "cancelled" ? "cancelled" : order.status === "paid" ? "paid" : ship ? "preparing" : "ready";
  let tracking: TrackedOrder["tracking"] = null;
  let delay: TrackedOrder["delay"] = null;
  let invoiceUrl: string | null = null;

  if (order.opistoOrderId) {
    try {
      const remote = await getOrder(order.opistoOrderId);
      const number = clean(remote?.DeliveryInfos?.DeliveryNumber);
      if (ship && number) {
        tracking = { number, transporter: clean(remote?.DeliveryInfos?.Transporter) };
        stage = "shipped";
      }
      if (ship && remote?.Shipping?.DelayMax) delay = { min: remote.Shipping.DelayMin ?? 1, max: remote.Shipping.DelayMax };
      if (remote?.HasInvoice) invoiceUrl = await getOrderInvoiceUrl(order.opistoOrderId);
    } catch (err) {
      console.warn(`[suivi ${order.ref}] lecture Opisto impossible :`, err instanceof Error ? err.message : err);
    }
  }

  const to = ship ? (order.delivery ?? order.billing) : null;
  return {
    ref: order.ref,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    stage,
    deliveryMode: ship ? "shipping" : "pickup",
    items: order.items.map(({ id, name, brandName, modelName, reference, priceTtc, photo, href }) => ({ id, name, brandName, modelName, reference, priceTtc, photo, href })),
    subtotal: Number(order.subtotalTtc),
    shipping: Number(order.shippingTtc),
    total: Number(order.totalTtc),
    deliveryTo: to ? { name: `${to.firstname} ${to.lastname}`, postcode: to.postcode, city: to.city } : null,
    tracking,
    delay,
    invoiceUrl,
  };
}
