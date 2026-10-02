import { NextResponse } from "next/server";
import { currentAccount, publicAccount } from "@/lib/account/accounts";

/** Compte connecté (ou null) : sert à afficher « Mon compte » et les tarifs professionnels. */
export const dynamic = "force-dynamic";

export async function GET() {
  const account = await currentAccount();
  return NextResponse.json({ account: account ? publicAccount(account) : null }, { headers: { "Cache-Control": "private, no-store" } });
}
