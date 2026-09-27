import "server-only";
import { orderToken } from "@/lib/orders/refs";
import { updateOrder } from "@/lib/orders/checkout";
import { site } from "@/lib/site";
import type { PaymentProvider } from "./index";

/**
 * Paiement simulé (développement et aperçus uniquement) : renvoie vers une
 * page interne qui « encaisse » la commande sans carte. Permet de tester
 * tout le tunnel, y compris la création de commande chez Opisto en
 * préproduction, en attendant les clés Stripe.
 */
export const provider: PaymentProvider = {
  name: "test",
  async createCheckout(order) {
    const sessionId = `test_${order.ref}`;
    await updateOrder(order.id, { paymentSessionId: sessionId, paymentProvider: "test" });
    const url = `${site.url}/commande/paiement-test?ref=${encodeURIComponent(order.ref)}&t=${orderToken(order.ref)}`;
    return { url, sessionId, provider: "test" };
  },
};

export function fakePaymentsAllowed(): boolean {
  return !process.env.STRIPE_SECRET_KEY && process.env.VERCEL_ENV !== "production";
}
