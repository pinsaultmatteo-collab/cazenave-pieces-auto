import { NextResponse } from "next/server";
import { z } from "zod";
import { issueLoginCode } from "@/lib/account/codes";

/** Connexion, étape 1 : POST { email } → envoi d'un code à 6 chiffres par e-mail. */
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  const result = await issueLoginCode(parsed.data.email);
  if (!result.ok) {
    return result.reason === "rate_limited"
      ? NextResponse.json({ error: "Trop de demandes de code pour cette adresse. Réessayez dans une heure." }, { status: 429 })
      : NextResponse.json({ error: "La connexion par e-mail est momentanément indisponible. Appelez-nous si besoin." }, { status: 503 });
  }
  return NextResponse.json({ ok: true, devCode: result.devCode });
}
