import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { CategoryIcon } from "@/components/svg/CategoryIcons";
import { MODEL_PAGE_MIN_PARTS, getBrandBySlug, getCategoryFacets, getModelsWithCounts, getPhases, modelHref } from "@/lib/catalog";
import { phasePeriod } from "@/lib/catalog/phases";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

/** Nombre d'autres modèles de la marque proposés en bas de page (les plus fournis). */
const OTHER_MODELS = 18;

async function load(brandSlug: string, modelSlug: string) {
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) return null;
  const models = await getModelsWithCounts(brand.id);
  const model = models.find((m) => m.slug === modelSlug);
  return model ? { brand, model, models } : null;
}

const plural = (n: number, word: string) => `${n.toLocaleString("fr-FR")} ${word}${n > 1 ? "s" : ""}`;

// Page rendue à la demande (stock synchronisé, filtres dans l'URL).
export async function generateMetadata({ params }: PageProps<"/pieces-auto/marques/[brand]/[model]">): Promise<Metadata> {
  const { brand, model } = await params;
  const found = await load(brand, model);
  if (!found) return {};
  const { brand: b, model: m } = found;
  const facets = await getCategoryFacets({ brand: b.slug, model: m.slug });
  const families = facets
    .slice(0, 3)
    .map((f) => f.name.toLowerCase())
    .join(", ");
  return {
    title: `Pièces ${b.name} ${m.name} d'occasion`,
    description: `${plural(m.count, "pièce")} ${b.name} ${m.name} d'occasion en stock${families ? ` (${families}…)` : ""}, testées et garanties 12 mois. Expédition sous 24/48h depuis Colomiers ou retrait au comptoir.`,
    alternates: { canonical: modelHref(b.slug, m.slug) },
    // Trop peu de pièces : page utile au visiteur mais trop mince pour Google
    robots: m.count < MODEL_PAGE_MIN_PARTS ? { index: false, follow: true } : undefined,
  };
}

export default async function ModelPage({ params, searchParams }: PageProps<"/pieces-auto/marques/[brand]/[model]">) {
  const { brand, model } = await params;
  const found = await load(brand, model);
  if (!found) notFound();
  const { brand: b, model: m, models } = found;
  const href = modelHref(b.slug, m.slug);
  const sp = readCatalogParams(await searchParams);
  const [phases, facets] = await Promise.all([getPhases(b.slug, m.slug), getCategoryFacets({ brand: b.slug, model: m.slug })]);
  const dated = phases.filter((p) => p.from !== null);
  const years = dated.length ? phasePeriod({ from: Math.min(...dated.map((p) => p.from!)), to: dated.some((p) => p.to === null) ? null : Math.max(...dated.map((p) => p.to!)) }) : null;
  const others = models
    .filter((o) => o.slug !== m.slug && o.count > 0)
    .sort((x, y) => y.count - x.count)
    .slice(0, OTHER_MODELS)
    .sort((x, y) => x.name.localeCompare(y.name, "fr", { numeric: true }));

  return (
    <>
      <PageHero
        kicker={`${plural(m.count, "pièce")} en stock`}
        title={
          <>
            Pièces {b.name} <span className="text-brand-400">{m.name}</span> d&apos;occasion
          </>
        }
        text={`Pièces détachées ${b.name} ${m.name}${years ? ` (${years})` : ""} démontées dans notre centre VHU de Colomiers, contrôlées et garanties 12 mois. Indiquez l'année ou la phase de votre véhicule pour n'afficher que les pièces compatibles.`}
        image={photos.parcRows2}
        imageAlt={`Véhicules ${b.name} sur le parc de Colomiers`}
        crumbs={[
          { label: "Pièces auto", href: "/pieces-auto" },
          { label: "Marques", href: "/pieces-auto/marques" },
          { label: b.name, href: `/pieces-auto/marques/${b.slug}` },
          { label: m.name },
        ]}
        compact
      >
        {facets.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {facets.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`${href}?categorie=${c.slug}#recherche-resultats`}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    sp.category === c.slug ? "border-brand bg-brand text-ink-900" : "border-white/15 bg-white/5 text-white hover:border-brand-400 hover:bg-white/10"
                  }`}
                >
                  <CategoryIcon slug={c.slug} width={16} height={16} />
                  {c.name}
                  <span className="text-[10px] opacity-60">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageHero>

      <CatalogSection basePath={href} params={sp} fixed={{ brand: b.slug, model: m.slug }} />

      <section aria-labelledby="modele-infos" className="container-x pb-20 lg:pb-28">
        <div className="grid gap-10 rounded-3xl border border-line bg-mist p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="min-w-0">
            <h2 id="modele-infos" className="display-title text-3xl text-ink sm:text-4xl">
              Votre {b.name} {m.name} : trouver la bonne pièce
            </h2>
            <div className="mt-4 space-y-4 leading-7 text-steel">
              <p>
                Toutes nos pièces {b.name} {m.name} proviennent de véhicules hors d&apos;usage démontés dans notre centre agréé de Colomiers, près
                de Toulouse. Chaque pièce est contrôlée, photographiée et garantie 12 mois.
              </p>
              <p>
                D&apos;une phase à l&apos;autre, certaines pièces changent (optiques, pare-chocs, calculateurs). Choisissez l&apos;année de votre
                véhicule dans les filtres : la phase correspondante est sélectionnée pour vous. En cas de doute, envoyez-nous votre plaque
                d&apos;immatriculation par SMS au {site.sms} : nous vérifions la compatibilité avant l&apos;envoi.
              </p>
            </div>
            {phases.length > 0 && (
              <>
                <h3 className="mt-8 font-display text-xl font-semibold uppercase text-ink">Phases en stock</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {phases.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`${href}?phase=${p.slug}#recherche-resultats`}
                        className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-brand"
                      >
                        {p.label}
                        {p.from !== null && <span className="font-semibold text-steel">{phasePeriod(p)}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {others.length > 0 && (
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold uppercase text-ink">Autres modèles {b.name}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={modelHref(b.slug, o.slug)}
                      className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-brand"
                    >
                      {o.name}
                      <span className="text-[10px] text-steel">{o.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/pieces-auto/marques/${b.slug}`} className="mt-5 inline-block text-sm font-bold text-brand-700 hover:underline">
                Toutes les pièces {b.name}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
