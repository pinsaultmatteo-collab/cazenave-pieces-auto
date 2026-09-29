import { NextResponse } from "next/server";
import { getBrandBySlug, getBrandCounts, getBrands, getModels } from "@/lib/catalog";

/**
 * Listes du moteur « Marque et modèle » :
 *   /api/catalog/vehicles             → marques en stock (avec nombre de pièces)
 *   /api/catalog/vehicles?marque=slug → modèles en stock de cette marque
 */
export const dynamic = "force-dynamic";

const CACHE = { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" };

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("marque")?.trim().slice(0, 80);
  if (slug) {
    const brand = await getBrandBySlug(slug);
    const models = brand ? await getModels(brand.id) : [];
    return NextResponse.json({ models: models.map((m) => ({ slug: m.slug, name: m.name })) }, { headers: CACHE });
  }
  const [brands, counts] = await Promise.all([getBrands(), getBrandCounts()]);
  return NextResponse.json(
    { brands: brands.map((b) => ({ slug: b.slug, name: b.name, count: counts[b.id] ?? 0 })).filter((b) => b.count > 0) },
    { headers: CACHE },
  );
}
