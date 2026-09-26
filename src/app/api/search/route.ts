import { NextResponse } from "next/server";
import { partHref, searchParts, suggest, vehicleLabel } from "@/lib/catalog";

/**
 * Recherche instantanée de la barre du site : /api/search?q=alternateur
 * Renvoie quelques pièces (photo, véhicule, prix), les marques et les
 * catégories dont le nom correspond, et le nombre total de résultats.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ q, parts: [], brands: [], models: [], categories: [], total: 0 });

  const looksLikeRef = /^[a-z0-9][a-z0-9 .\-\/]{5,}$/i.test(q) && /\d{3,}/.test(q);
  const [byText, byRef, names] = await Promise.all([
    searchParts({ q, perPage: 6 }),
    looksLikeRef ? searchParts({ ref: q, perPage: 6 }) : Promise.resolve(null),
    suggest(q),
  ]);
  // Une référence saisie : les correspondances de référence passent devant.
  const seen = new Set<number>();
  const items = [...(byRef?.items ?? []), ...byText.items].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 6);
  const total = Math.max(byText.total, byRef?.total ?? 0);

  return NextResponse.json(
    {
      q,
      total,
      parts: items.map((p) => ({
        id: p.id,
        href: partHref(p),
        name: p.name,
        vehicle: vehicleLabel({ brandName: p.brandName ?? "", modelName: p.modelName ?? "", version: null }),
        reference: p.manufacturerReference,
        price: p.priceTtc,
        photo: p.vignette,
      })),
      brands: names.brands.map((b) => ({ name: b.name, href: `/pieces-auto/marques/${b.slug}` })),
      models: names.models.map((m) => ({ name: `${m.brandName} ${m.name}`, href: `/pieces-auto/marques/${m.brandSlug}?modele=${m.slug}` })),
      categories: names.categories.map((c) => ({ name: c.name, href: `/pieces-auto?categorie=${c.slug}` })),
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
  );
}
