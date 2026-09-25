import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { getCategories, getCategoryCounts } from "@/lib/catalog";
import { photos } from "@/lib/photos";
import { CategoryIcon } from "@/components/svg/CategoryIcons";
import { HeroSearch } from "@/components/home/HeroSearch";

export const metadata: Metadata = {
  title: "Pièces auto d'occasion en stock",
  description:
    "Toutes nos pièces auto d'occasion testées et garanties 12 mois : carrosserie, mécanique, éclairage, habitacle, électronique. Stock mis à jour toutes les 30 minutes, expédition sous 24/48h.",
  alternates: { canonical: "/pieces-auto" },
};

export default async function PartsPage({ searchParams }: PageProps<"/pieces-auto">) {
  const params = readCatalogParams(await searchParams);
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);

  return (
    <>
      <PageHero
        kicker="Le catalogue"
        title={
          <>
            Pièces auto <span className="text-brand-400">d&apos;occasion</span>
          </>
        }
        text="Chaque pièce est démontée, contrôlée, photographiée et garantie 12 mois. Filtrez par catégorie, marque et modèle, ou recherchez directement une référence."
        image={photos.aisleWide}
        imageAlt="Allée de rayonnages de pièces d'occasion"
        crumbs={[{ label: "Pièces auto" }]}
        aside={
          <div id="recherche" className="[perspective:1200px]">
            <HeroSearch />
            <p className="mt-3 text-center text-xs text-white/50">Saisissez votre plaque : nous n&apos;affichons que les pièces compatibles.</p>
          </div>
        }
        compact
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/pieces-auto/${c.slug}`}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  params.category === c.slug
                    ? "border-brand bg-brand text-ink-900"
                    : "border-white/15 bg-white/5 text-white hover:border-brand-400 hover:bg-white/10"
                }`}
              >
                <CategoryIcon slug={c.slug} width={16} height={16} />
                {c.name}
                <span className="text-[10px] opacity-60">{counts[c.id] ?? 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageHero>
      <CatalogSection basePath="/pieces-auto" params={params} />
    </>
  );
}
