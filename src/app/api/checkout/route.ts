import { NextResponse } from "next/server";
import { CheckoutError, createPendingOrder } from "@/lib/orders/checkout";
import { checkoutUrls, paymentProvider } from "@/lib/payment";

/**
 * Démarre une commande : vérifie le panier, enregistre la commande en
 * attente et renvoie l'adresse de la page de paiement.
 *   POST /api/checkout  { email, items: [ids], deliveryMode, billing, … }
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }
  try {
    const order = await createPendingOrder(body as Parameters<typeof createPendingOrder>[0]);
    const session = await paymentProvider().createCheckout(order, checkoutUrls(order.ref));
    return NextResponse.json({ ref: order.ref, url: session.url, provider: session.provider });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message, code: err.code, details: err.details ?? null }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout]", message);
    return NextResponse.json({ error: "Le paiement n'a pas pu être démarré, merci de réessayer ou de nous appeler." }, { status: 500 });
  }
}
