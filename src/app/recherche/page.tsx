import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Recherche de pièces",
  robots: { index: false, follow: true },
};

const normalizePlate = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]{2})(\d{3})([A-Z]{2})$/, "$1-$2-$3");

export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const sp = await searchParams;
  const params = readCatalogParams(sp);
  const immat = Array.isArray(sp.immat) ? sp.immat[0] : sp.immat;
  const plate = immat ? normalizePlate(immat) : null;
  const hasQuery = Boolean(params.q || params.ref);

  const title = plate
    ? `Pièces compatibles avec ${plate}`
    : params.ref
      ? `Référence « ${params.ref} »`
      : params.q
        ? `Résultats pour « ${params.q} »`
        : "Rechercher une pièce";

  return (
    <>
      <PageHero
        kicker="Recherche"
        title={title}
        image={photos.aisle}
        imageAlt="Allée de rayonnages"
        crumbs={[{ label: "Recherche" }]}
        compact
      >
        <form action="/recherche" method="get" role="search" className="mt-8 flex max-w-xl overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur">
          <label htmlFor="search-q" className="sr-only">
            Rechercher une pièce
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Nom de pièce, marque, modèle, référence…"
            className="w-full bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/50"
          />
          <button type="submit" className="flex items-center bg-brand px-5 text-ink-900" aria-label="Rechercher">
            <SearchIcon />
          </button>
        </form>
      </PageHero>

      {plate && (
        <div className="container-x pt-10">
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <p className="font-display text-2xl font-semibold uppercase text-ink">Identification par immatriculation : bientôt disponible</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">
              La reconnaissance automatique du véhicule à partir de la plaque <strong>{plate}</strong> est en cours de
              raccordement. En attendant, recherchez par marque et modèle ci-dessous, ou envoyez-nous votre immatriculation
              et la pièce recherchée par SMS : nous vérifions la compatibilité pour vous.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`${site.smsHref}?body=${encodeURIComponent(`Bonjour, je cherche une pièce pour le véhicule ${plate} : `)}`} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-brand-400">
                SMS au {site.sms}
              </a>
              <Link href="/pieces-auto/marques" className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brand">
                Rechercher par marque
              </Link>
            </div>
          </div>
        </div>
      )}

      {hasQuery || !plate ? <CatalogSection basePath="/recherche" params={params} /> : null}
    </>
  );
}
