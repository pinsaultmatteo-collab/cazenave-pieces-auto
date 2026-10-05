import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { getBrandBySlug, getBrandCounts, getModelsWithCounts, modelHref } from "@/lib/catalog";
import { photos } from "@/lib/photos";

// Page rendue à la demande (stock synchronisé, filtres dans l'URL).
export async function generateMetadata({ params }: PageProps<"/pieces-auto/marques/[brand]">): Promise<Metadata> {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) return {};
  return {
    title: `Pièces ${b.name} d'occasion`,
    description: `Pièces détachées ${b.name} d'occasion testées et garanties 12 mois : carrosserie, moteur, boîte de vitesses, éclairage, habitacle. Expédition sous 24/48h depuis Colomiers.`,
    alternates: { canonical: `/pieces-auto/marques/${b.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/pieces-auto/marques/[brand]">) {
  const { brand } = await params;
  const b = await getBrandBySlug(brand);
  if (!b) notFound();
  const [models, counts] = await Promise.all([getModelsWithCounts(b.id), getBrandCounts()]);
  const sp = readCatalogParams(await searchParams);

  return (
    <>
      <PageHero
        kicker={`${(counts[b.id] ?? 0).toLocaleString("fr-FR")} pièces en stock`}
        title={
          <>
            Pièces <span className="text-brand-400">{b.name}</span> d&apos;occasion
          </>
        }
        text={`Toutes nos pièces ${b.name} issues de véhicules démontés dans notre centre de Colomiers. Choisissez un modèle pour affiner.`}
        image={photos.parcRows2}
        imageAlt={`Véhicules ${b.name} sur le parc`}
        crumbs={[{ label: "Pièces auto", href: "/pieces-auto" }, { label: "Marques", href: "/pieces-auto/marques" }, { label: b.name }]}
        compact
      >
        {models.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {models.map((m) => (
              <li key={m.slug}>
                <Link
                  href={modelHref(b.slug, m.slug)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-white transition hover:border-brand-400 hover:bg-white/10"
                >
                  {m.name}
                  <span className="text-[10px] opacity-60">{m.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageHero>
      <CatalogSection basePath={`/pieces-auto/marques/${b.slug}`} params={sp} fixed={{ brand: b.slug }} />
    </>
  );
}
