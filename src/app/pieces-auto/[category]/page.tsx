import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { getCategories, getCategoryBySlug, getCategoryCounts } from "@/lib/catalog";
import { photos } from "@/lib/photos";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholders";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pieces-auto/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: `${cat.name} d'occasion`,
    description: `${cat.name} d'occasion testés et garantis 12 mois, démontés dans notre centre de Colomiers. ${cat.description ?? ""} Expédition sous 24/48h partout en France.`,
    alternates: { canonical: `/pieces-auto/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/pieces-auto/[category]">) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();
  const counts = await getCategoryCounts();
  const heroPhoto = PLACEHOLDER_CATEGORIES.find((c) => c.slug === cat.slug)?.photo ?? photos.aisle;

  return (
    <>
      <PageHero
        kicker={`${counts[cat.id] ?? 0} pièces en stock`}
        title={cat.name}
        text={cat.description}
        image={heroPhoto}
        imageAlt={cat.name}
        crumbs={[{ label: "Pièces auto", href: "/pieces-auto" }, { label: cat.name }]}
        compact
      />
      <CatalogSection basePath={`/pieces-auto/${cat.slug}`} params={readCatalogParams(await searchParams)} fixed={{ category: cat.slug }} />
    </>
  );
}
