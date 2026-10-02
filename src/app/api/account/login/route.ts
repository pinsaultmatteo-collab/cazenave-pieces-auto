import { NextResponse } from "next/server";
import { z } from "zod";
import { loadAccount, publicAccount } from "@/lib/account/accounts";
import { verifyLoginCode } from "@/lib/account/codes";
import { openSession } from "@/lib/account/session";

/** Connexion, étape 2 : POST { email, code } → session ouverte, statut pro relu dans Opisto. */
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(200), code: z.string().trim().min(6).max(12) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Saisissez le code à 6 chiffres reçu par e-mail." }, { status: 400 });
  if (!(await verifyLoginCode(parsed.data.email, parsed.data.code))) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Code incorrect ou expiré. Vérifiez-le, ou demandez-en un nouveau." }, { status: 401 });
  }
  const account = await loadAccount(parsed.data.email, { refresh: true, login: true });
  await openSession(account.email);
  return NextResponse.json({ account: publicAccount(account) }, { headers: { "Cache-Control": "no-store" } });
}
