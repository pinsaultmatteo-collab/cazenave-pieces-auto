import "server-only";
import Stripe from "stripe";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { getOrderByRef, updateOrder } from "@/lib/orders/checkout";
import type { PaymentProvider } from "./index";

let client: Stripe | null = null;

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  if (!client) client = new Stripe(key, { appInfo: { name: "Cazenave Pièces Auto", url: "https://cazenave.net" } });
  return client;
}

const toCents = (euros: number | string) => Math.round(Number(euros) * 100);

/** Session Stripe Checkout : une ligne par pièce, plus la livraison le cas échéant. */
export const provider: PaymentProvider = {
  name: "stripe",
  async createCheckout(order, urls) {
    const stripe = stripeClient();
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((i) => ({
      quantity: 1,
      price_data: {
        currency: order.currency,
        unit_amount: toCents(i.priceTtc),
        product_data: {
          name: `${i.name} ${[i.brandName, i.modelName].filter(Boolean).join(" ")}`.trim(),
          description: i.reference ? `Réf. ${i.reference} · pièce n° ${i.id}` : `Pièce n° ${i.id}`,
          images: i.photo ? [i.photo] : undefined,
          metadata: { partId: String(i.id) },
        },
      },
    }));
    if (Number(order.shippingTtc) > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency: order.currency, unit_amount: toCents(order.shippingTtc), product_data: { name: "Livraison à domicile" } },
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: order.email,
      client_reference_id: order.ref,
      line_items,
      metadata: { orderRef: order.ref },
      payment_intent_data: { metadata: { orderRef: order.ref }, description: `Commande ${order.ref}` },
      success_url: urls.success,
      cancel_url: urls.cancel,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    if (!session.url) throw new Error("Stripe n'a pas renvoyé d'adresse de paiement");
    await updateOrder(order.id, { paymentSessionId: session.id, paymentProvider: "stripe" });
    return { url: session.url, sessionId: session.id, provider: "stripe" };
  },
};

/**
 * Inscrit le numéro de transaction Opisto sur le paiement Stripe, pour
 * rapprocher les deux dans le tableau de bord. Sans effet bloquant.
 */
export async function labelStripePayment(paymentIntentId: string, orderNumber: string, internalRef: string) {
  if (!paymentIntentId.startsWith("pi_")) return;
  try {
    await stripeClient().paymentIntents.update(paymentIntentId, {
      description: `Commande n° ${orderNumber}`,
      metadata: { orderRef: internalRef, opistoOrderId: orderNumber },
    });
  } catch (err) {
    console.warn(`[commande ${internalRef}] mise à jour du paiement Stripe impossible :`, err instanceof Error ? err.message : err);
  }
}

/** Traite un événement Stripe (webhook) : paiement réussi ou session expirée. */
export async function handleStripeEvent(event: Stripe.Event): Promise<{ handled: boolean; ref?: string }> {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const ref = session.metadata?.orderRef ?? session.client_reference_id ?? undefined;
    if (!ref) return { handled: false };
    if (session.payment_status !== "paid") return { handled: false, ref };
    await fulfillOrder(ref, {
      provider: "stripe",
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? session.id),
      amount: session.amount_total ? session.amount_total / 100 : undefined,
    });
    return { handled: true, ref };
  }
  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    const ref = session.metadata?.orderRef ?? session.client_reference_id ?? undefined;
    if (!ref) return { handled: false };
    const order = await getOrderByRef(ref);
    if (order && order.status === "pending") await updateOrder(order.id, { status: "cancelled" });
    return { handled: true, ref };
  }
  return { handled: false };
}

/**
 * Au retour sur la page de confirmation, vérifie directement la session
 * (le webhook peut arriver quelques secondes plus tard) et finalise si payée.
 */
export async function confirmFromSession(sessionId: string) {
  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const ref = session.metadata?.orderRef ?? session.client_reference_id ?? null;
  if (!ref) return null;
  if (session.payment_status === "paid") {
    return fulfillOrder(ref, {
      provider: "stripe",
      sessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? session.id),
    });
  }
  return getOrderByRef(ref);
}
