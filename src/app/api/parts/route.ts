import { getPart } from "@/lib/catalog";

/** Renvoie les pièces demandées par identifiant : /api/parts?ids=1,2,3 (panier). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50);
  const parts = (await Promise.all(ids.map((id) => getPart(id)))).filter((p) => p !== null);
  return Response.json({ parts });
}
