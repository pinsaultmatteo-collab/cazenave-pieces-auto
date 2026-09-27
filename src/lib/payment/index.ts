import "server-only";
import type { OrderRow } from "@/db/schema";
import { site } from "@/lib/site";
import * as stripe from "./stripe";
import * as fake from "./fake";

/**
 * Fournisseur de paiement.
 * - Stripe dès que STRIPE_SECRET_KEY est renseignée (Checkout hébergé).
 * - Sinon, hors production, un paiement simulé pour tester le tunnel de
 *   bout en bout (aucune carte, aucun argent).
 */
export type CheckoutSession = { url: string; sessionId: string | null; provider: "stripe" | "test" };

export type PaymentProvider = {
  name: "stripe" | "test";
  createCheckout(order: OrderRow, urls: { success: string; cancel: string }): Promise<CheckoutSession>;
};

export function paymentProvider(): PaymentProvider {
  if (process.env.STRIPE_SECRET_KEY) return stripe.provider;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    throw new Error("Paiement indisponible : STRIPE_SECRET_KEY manquante en production");
  }
  return fake.provider;
}

export function isPaymentConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) || process.env.VERCEL_ENV !== "production";
}

export function checkoutUrls(ref: string) {
  const base = site.url;
  return {
    success: `${base}/commande/confirmation?ref=${encodeURIComponent(ref)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel: `${base}/commande?annule=${encodeURIComponent(ref)}`,
  };
}
