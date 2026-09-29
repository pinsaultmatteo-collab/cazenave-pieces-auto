import { NextResponse } from "next/server";
import { z } from "zod";
import { trackOrder } from "@/lib/orders/track";

/** Suivi de commande : POST { ref, email } → état de la commande. `ref` : numéro de transaction Opisto (ou ancienne référence CZ-…). */
export const dynamic = "force-dynamic";

const schema = z.object({
  ref: z.string().trim().min(5).max(20),
  email: z.string().trim().email().max(200),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Indiquez votre numéro de commande et votre e-mail." }, { status: 400 });
  const order = await trackOrder(parsed.data.ref, parsed.data.email);
  if (!order) {
    // Petit délai pour décourager les essais en série
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Aucune commande ne correspond à ce numéro et à cet e-mail. Vérifiez le numéro de transaction indiqué sur votre e-mail de confirmation ou votre facture." }, { status: 404 });
  }
  return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
