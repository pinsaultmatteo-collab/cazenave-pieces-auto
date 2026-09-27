import { NextResponse } from "next/server";
import { handleStripeEvent, stripeClient } from "@/lib/payment/stripe";

/**
 * Webhook Stripe : à configurer dans le tableau de bord Stripe sur
 * https://<site>/api/stripe/webhook avec les événements
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed et checkout.session.expired.
 * Le secret de signature va dans STRIPE_WEBHOOK_SECRET.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Webhook Stripe non configuré" }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  const payload = await request.text();
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide : ${err instanceof Error ? err.message : String(err)}` }, { status: 400 });
  }
  try {
    const result = await handleStripeEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    // Stripe réessaie en cas d'erreur 5xx : le traitement est idempotent.
    console.error("[stripe webhook]", event.type, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Traitement échoué, nouvelle tentative attendue" }, { status: 500 });
  }
}
