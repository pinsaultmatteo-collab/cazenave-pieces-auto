import { NextResponse } from "next/server";
import { z } from "zod";
import { trackOrder } from "@/lib/orders/track";

/** Suivi de commande : POST { ref, email } → état de la commande. */
export const dynamic = "force-dynamic";

const schema = z.object({
  ref: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(200),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Indiquez votre référence de commande et votre e-mail." }, { status: 400 });
  const order = await trackOrder(parsed.data.ref, parsed.data.email);
  if (!order) {
    // Petit délai pour décourager les essais en série
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Aucune commande ne correspond à cette référence et cet e-mail." }, { status: 404 });
  }
  return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
