import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, type NewOrderRow, type OrderAddress, type OrderItem, type OrderRow } from "@/db/schema";
import { getPart, partHref } from "@/lib/catalog";
import { checkoutSchema, type CheckoutData, type CheckoutInput } from "./schema";
import { newOrderRef } from "./refs";

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly code: "validation" | "unavailable" | "shipping" | "empty",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function toAddress(a: CheckoutData["billing"]): OrderAddress {
  return {
    firstname: a.firstname,
    lastname: a.lastname,
    company: a.company || null,
    phone: a.phone,
    street: a.street,
    streetAdditional: a.streetAdditional || null,
    postcode: a.postcode,
    city: a.city,
    country: a.country,
  };
}

/**
 * Vérifie le panier, fige les pièces et les montants, et enregistre la
 * commande « en attente de paiement ». Les pièces sont uniques : une pièce
 * déjà vendue ou retirée fait échouer la commande avant tout paiement.
 */
export async function createPendingOrder(raw: CheckoutInput): Promise<OrderRow> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) throw new CheckoutError("Formulaire incomplet", "validation", parsed.error.flatten());
  const data = parsed.data;
  if (data.website) throw new CheckoutError("Requête rejetée", "validation");

  const ids = [...new Set(data.items)];
  const parts = await Promise.all(ids.map((id) => getPart(id)));
  const missing = ids.filter((id, i) => !parts[i]);
  const unavailable = parts.filter((p): p is NonNullable<typeof p> => !!p && !(p.available && p.inStock));
  if (missing.length || unavailable.length) {
    throw new CheckoutError("Certaines pièces ne sont plus disponibles", "unavailable", {
      ids: [...missing, ...unavailable.map((p) => p.id)],
    });
  }
  const live = parts.filter((p): p is NonNullable<typeof p> => !!p);
  if (!live.length) throw new CheckoutError("Panier vide", "empty");

  if (data.deliveryMode === "shipping") {
    const noShip = live.filter((p) => !p.shippingAvailable);
    if (noShip.length) {
      throw new CheckoutError("Certaines pièces ne peuvent pas être expédiées : choisissez le retrait au comptoir", "shipping", { ids: noShip.map((p) => p.id) });
    }
  }

  const items: OrderItem[] = live.map((p) => ({
    id: p.id,
    name: p.name,
    brandName: p.brandName,
    modelName: p.modelName,
    reference: p.manufacturerReference,
    priceTtc: p.priceTtc,
    vatRate: p.vatRate,
    shippingCost: p.shippingAvailable ? (p.shippingCost ?? 0) : null,
    shippingId: p.shippingAvailable ? (p.shippingId ?? null) : null,
    photo: p.vignette,
    href: partHref(p),
  }));
  const subtotal = round2(items.reduce((s, i) => s + i.priceTtc, 0));
  const shipping = data.deliveryMode === "shipping" ? round2(items.reduce((s, i) => s + (i.shippingCost ?? 0), 0)) : 0;
  const total = round2(subtotal + shipping);

  const billing = toAddress(data.billing);
  const delivery = data.deliveryMode === "shipping" ? (data.shipToBilling || !data.delivery ? billing : toAddress(data.delivery)) : null;

  const row: NewOrderRow = {
    ref: newOrderRef(),
    status: "pending",
    email: data.email.toLowerCase(),
    customer: { firstname: billing.firstname, lastname: billing.lastname, phone: billing.phone, company: billing.company ?? null },
    billing,
    delivery,
    deliveryMode: data.deliveryMode,
    items,
    subtotalTtc: subtotal.toFixed(2),
    shippingTtc: shipping.toFixed(2),
    totalTtc: total.toFixed(2),
    note: data.note || null,
    paymentProvider: process.env.STRIPE_SECRET_KEY ? "stripe" : "test",
  };
  const db = await getDb();
  const [created] = await db.insert(orders).values(row).returning();
  return created;
}

export async function getOrderByRef(ref: string): Promise<OrderRow | null> {
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.ref, ref)).limit(1);
  return row ?? null;
}

export async function getOrderBySession(sessionId: string): Promise<OrderRow | null> {
  const db = await getDb();
  const [row] = await db.select().from(orders).where(eq(orders.paymentSessionId, sessionId)).limit(1);
  return row ?? null;
}

export async function updateOrder(id: number, patch: Partial<NewOrderRow>): Promise<OrderRow> {
  const db = await getDb();
  const [row] = await db
    .update(orders)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();
  return row;
}

/** Champs d'affichage d'une commande (évite l'accès direct à `ref` dans les composants). */
export function orderSummary(order: OrderRow) {
  return { ref: order.ref, status: order.status, count: order.items.length, total: Number(order.totalTtc) };
}
