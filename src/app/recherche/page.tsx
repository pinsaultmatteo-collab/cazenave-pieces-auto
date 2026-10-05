import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { CatalogSection, readCatalogParams } from "@/components/catalog/catalog-page";
import { PartsGrid } from "@/components/catalog/PartsGrid";
import { modelHref, searchParts } from "@/lib/catalog";
import { lookupPlate, matchCatalogVehicle, normalizePlate, type CatalogVehicle, type PlateResult, type PlateVehicle } from "@/lib/plate";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { CheckIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Recherche de pièces",
  robots: { index: false, follow: true },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Lien vers le catalogue filtré sur le véhicule identifié. */
function catalogHref(match: CatalogVehicle) {
  if (!match.model) return `/pieces-auto/marques/${match.brand}#recherche-resultats`;
  const sp = new URLSearchParams();
  if (match.year) sp.set("annee", String(match.year));
  if (match.phase) sp.set("phase", match.phase);
  const qs = sp.toString();
  return `${modelHref(match.brand!, match.model)}${qs ? `?${qs}` : ""}#recherche-resultats`;
}

function PlateBadge({ plate }: { plate: string }) {
  return (
    <span className="inline-flex overflow-hidden rounded-md border-2 border-ink bg-white font-display text-xl font-semibold tracking-[0.15em] text-ink">
      <span className="flex w-6 flex-col items-center justify-center bg-[#003399] text-[9px] font-bold leading-none text-white">
        <span className="text-[11px]">★</span>F
      </span>
      <span className="px-3 py-1">{plate}</span>
    </span>
  );
}

function VehicleCard({ vehicle, match }: { vehicle: PlateVehicle; match: CatalogVehicle }) {
  const facts = [
    vehicle.firstRegistration ? `Mise en circulation ${new Date(vehicle.firstRegistration).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}` : null,
    vehicle.energy,
    vehicle.gearbox,
    vehicle.doors ? `${vehicle.doors} portes` : null,
    vehicle.bodyType,
  ].filter(Boolean) as string[];
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-700">
          <CheckIcon size={16} /> Véhicule identifié
        </p>
        <p className="display-title mt-2 text-3xl text-ink sm:text-4xl">
          {vehicle.brand} {vehicle.model}
        </p>
        {vehicle.version && <p className="mt-1 font-semibold text-ink">{vehicle.version}</p>}
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <PlateBadge plate={vehicle.plate} />
          </li>
          {facts.map((f) => (
            <li key={f} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-steel">
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
        {match.brand && (
          <Link
            href={catalogHref(match)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700"
          >
            Toutes les pièces de ce modèle <ChevronRightIcon size={18} />
          </Link>
        )}
        <Link href="/pieces-auto#recherche" className="text-center text-xs font-semibold text-steel underline hover:text-ink">
          Ce n&apos;est pas votre véhicule ?
        </Link>
      </div>
    </div>
  );
}

/** Plaque non identifiée : repli vers la recherche par marque et modèle, ou par SMS. */
function Fallback({ plate, status }: { plate: string; status: Exclude<PlateResult["status"], "found"> | "invalid" }) {
  const copy = {
    invalid: {
      title: "Plaque non reconnue",
      text: "Vérifiez le format de l'immatriculation (AB-123-CD, ou 123 ABC 31 pour les anciennes plaques), ou recherchez votre véhicule par marque et modèle.",
    },
    not_found: {
      title: "Véhicule introuvable",
      text: `Nous n'avons pas pu identifier le véhicule immatriculé ${plate}. Recherchez-le par marque et modèle, ou envoyez-nous la plaque et la pièce recherchée par SMS : nous vérifions la compatibilité pour vous.`,
    },
    unavailable: {
      title: "Recherche par plaque momentanément indisponible",
      text: "Le service d'identification ne répond pas pour le moment. Recherchez votre véhicule par marque et modèle, ou envoyez-nous la plaque par SMS : nous vérifions la compatibilité pour vous.",
    },
    not_configured: {
      title: "Identification par immatriculation : bientôt disponible",
      text: `La reconnaissance automatique du véhicule à partir de la plaque ${plate} est en cours de raccordement. En attendant, recherchez par marque et modèle, ou envoyez-nous la plaque et la pièce recherchée par SMS.`,
    },
  }[status];
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
      <p className="font-display text-2xl font-semibold uppercase text-ink">{copy.title}</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink">{copy.text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/pieces-auto#recherche" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-brand-400">
          Rechercher par marque et modèle
        </Link>
        <a
          href={`${site.smsHref}?body=${encodeURIComponent(`Bonjour, je cherche une pièce pour le véhicule ${plate} : `)}`}
          className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brand"
        >
          SMS au {site.sms}
        </a>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const sp = await searchParams;
  const params = readCatalogParams(sp);
  const immat = first(sp.immat)?.slice(0, 20);
  const plate = immat ? normalizePlate(immat) : null;
  const hasQuery = Boolean(params.q || params.ref);

  // Recherche par plaque : identification du véhicule, puis pièces de ce véhicule
  const lookup = plate ? await lookupPlate(plate) : null;
  const vehicle = lookup?.status === "found" ? lookup.vehicle : null;
  const match = vehicle ? await matchCatalogVehicle(vehicle) : null;
  const exact = vehicle?.ktype ? await searchParts({ ktype: vehicle.ktype, perPage: 8 }) : null;

  const title = vehicle
    ? `Pièces pour ${vehicle.brand} ${vehicle.model}`
    : plate || immat
      ? `Plaque ${plate ?? immat?.toUpperCase()}`
      : params.ref
        ? `Référence « ${params.ref} »`
        : params.q
          ? `Résultats pour « ${params.q} »`
          : "Rechercher une pièce";

  const vehicleParams = match?.brand
    ? readCatalogParams({
        marque: match.brand,
        modele: match.model ?? undefined,
        annee: match.model && match.year ? String(match.year) : undefined,
        sort: params.sort,
        page: String(params.page),
      })
    : null;

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

      {immat && (
        <div className="container-x space-y-8 pt-10">
          {vehicle && match ? (
            <>
              <VehicleCard vehicle={vehicle} match={match} />
              {exact && exact.total > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-semibold uppercase text-ink">
                    Issues d&apos;un véhicule identique au vôtre <span className="text-steel">({exact.total})</span>
                  </h2>
                  <p className="mt-1 text-sm text-steel">Même modèle et même version : la compatibilité est la plus sûre.</p>
                  <div className="mt-5">
                    <PartsGrid parts={exact.items} />
                  </div>
                </section>
              )}
              {!match.model && (
                <p className="rounded-2xl border border-line bg-white px-5 py-4 text-sm text-steel">
                  Nous avons identifié la marque mais pas le modèle exact dans notre stock : précisez-le dans les filtres ci-dessous.
                </p>
              )}
            </>
          ) : (
            <Fallback plate={plate ?? immat.toUpperCase()} status={plate ? (lookup?.status as Exclude<PlateResult["status"], "found">) : "invalid"} />
          )}
        </div>
      )}

      {vehicleParams ? (
        <CatalogSection basePath="/pieces-auto" params={vehicleParams} />
      ) : hasQuery || !immat ? (
        <CatalogSection basePath="/recherche" params={params} />
      ) : null}
    </>
  );
}
