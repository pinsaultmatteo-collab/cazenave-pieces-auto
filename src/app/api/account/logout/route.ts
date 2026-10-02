import { NextResponse } from "next/server";
import { closeSession } from "@/lib/account/session";

/** Déconnexion : POST → cookie de session supprimé. */
export const dynamic = "force-dynamic";

export async function POST() {
  await closeSession();
  return NextResponse.json({ ok: true });
}
