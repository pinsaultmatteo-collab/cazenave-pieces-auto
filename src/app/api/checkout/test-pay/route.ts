import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/orders/fulfill";
import { getOrderByRef } from "@/lib/orders/checkout";
import { verifyOrderToken } from "@/lib/orders/refs";
import { fakePaymentsAllowed } from "@/lib/payment/fake";

/**
 * Paiement simulé (jamais en production) : marque la commande comme payée
 * et déclenche le même traitement qu'un vrai paiement Stripe.
 *   POST /api/checkout/test-pay  { ref, t }
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!fakePaymentsAllowed()) return NextResponse.json({ error: "Paiement simulé désactivé" }, { status: 403 });
  const { ref, t } = (await request.json().catch(() => ({}))) as { ref?: string; t?: string };
  if (!ref || !verifyOrderToken(ref, t)) return NextResponse.json({ error: "Jeton invalide" }, { status: 403 });
  const order = await getOrderByRef(ref);
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  const result = await fulfillOrder(ref, { provider: "test", sessionId: `test_${ref}`, paymentIntentId: `test_pi_${randomBytes(6).toString("hex")}` });
  return NextResponse.json({ ref: result.ref, status: result.status, opistoOrderId: result.opistoOrderId, error: result.opistoError });
}
