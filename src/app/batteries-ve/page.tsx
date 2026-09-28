import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { PartsGrid } from "@/components/catalog/PartsGrid";
import { Pagination } from "@/components/catalog/Pagination";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { searchParts, type PartSort } from "@/lib/catalog";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";
import certIndraExpert from "@/assets/brand/cert-indra-expert.jpg";
import { CheckIcon, ChevronRightIcon, ClockIcon, PhoneIcon, PinIcon, ShieldIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Batteries de véhicules électriques d'occasion",
  description:
    "Batteries de traction d'occasion prêtes au réemploi et batteries à usage industriel (modules pour stockage d'énergie), issues de véhicules électriques et hybrides traités dans notre centre de Colomiers.",
  alternates: { canonical: "/batteries-ve" },
};

/** Stock mis à jour toutes les 30 minutes. */
export const revalidate = 600;

/** Nom Opisto des batteries revendables (sous-catégorie). */
const TRACTION = "batterie de traction";
const PER_PAGE = 12;

const REUSE_POINTS = [
  "Batterie d'origine constructeur, identifiée avec son véhicule donneur",
  "Démontage et mise en sécurité dans notre centre, référencé Indra Centre Expert pour les véhicules électriques et hybrides",
  "Photos, référence et véhicule d'origine sur chaque fiche pour vérifier la compatibilité",
  "Installation à confier à un professionnel habilité à intervenir sur les véhicules électriques",
];

const INDUSTRIAL_USES = [
  { title: "Stockage d'énergie", text: "Stockage stationnaire couplé à du photovoltaïque, écrêtage de consommation, alimentation de secours." },
  { title: "Machines et engins", text: "Alimentation de matériels électriques, chariots, véhicules spéciaux ou prototypes." },
  { title: "Recherche et essais", text: "Bancs d'essai, formation, développement de systèmes de gestion de batterie." },
  { title: "Reconditionnement", text: "Récupération de modules sains pour la remise en état d'autres packs." },
];

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function BatteriesPage({ searchParams }: PageProps<"/batteries-ve">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(str(sp.page)) || 1);
  const sortParam = str(sp.sort);
  const sort = (sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : undefined) as PartSort | undefined;
  const result = await searchParts({ name: TRACTION, page, perPage: PER_PAGE, sort });

  return (
    <>
      <PageHero
        kicker="Véhicules électriques et hybrides"
        title={
          <>
            Nos batteries <span className="text-brand-400">VE</span>
          </>
        }
        text="Les batteries des véhicules électriques et hybrides que nous traitons ont une seconde vie : remontées dans un autre véhicule quand elles sont en état, ou valorisées pour un usage industriel quand leurs modules peuvent encore servir."
        image={photos.evBattery}
        imageAlt="Batterie de véhicule électrique démontée dans l'atelier"
        crumbs={[{ label: "Batteries VE" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#reemploi" className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
            Batteries au réemploi
          </a>
          <a
            href="#industriel"
            className="rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            Usage industriel
          </a>
        </div>
      </PageHero>

      {/* Les deux filières */}
      <section className="border-b border-line bg-white">
        <Stagger className="container-x grid gap-5 py-10 md:grid-cols-[1fr_1fr_auto] md:items-stretch lg:py-12" stagger={0.1}>
          <StaggerItem>
            <a href="#reemploi" className="group flex h-full flex-col rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-brand hover:shadow-lg hover:shadow-ink/10">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700">Filière 1</span>
              <span className="mt-2 font-display text-3xl font-semibold uppercase leading-none text-ink">Prêtes au réemploi</span>
              <span className="mt-3 flex-1 text-sm leading-6 text-steel">
                Batteries de traction en état d&apos;être revendues et réinstallées dans un véhicule. {result.total > 0 ? `${result.total} en stock aujourd'hui.` : ""}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Voir le stock <ChevronRightIcon size={16} className="transition group-hover:translate-x-0.5" />
              </span>
            </a>
          </StaggerItem>
          <StaggerItem>
            <a href="#industriel" className="group flex h-full flex-col rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-brand hover:shadow-lg hover:shadow-ink/10">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700">Filière 2</span>
              <span className="mt-2 font-display text-3xl font-semibold uppercase leading-none text-ink">Usage industriel</span>
              <span className="mt-3 flex-1 text-sm leading-6 text-steel">
                Batteries endommagées dont les modules, neufs ou en bon état, peuvent resservir hors de l&apos;automobile.
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700">
                Nous contacter <ChevronRightIcon size={16} className="transition group-hover:translate-x-0.5" />
              </span>
            </a>
          </StaggerItem>
          <StaggerItem className="flex items-center gap-4 rounded-2xl bg-mist p-6 md:max-w-xs">
            <Image src={certIndraExpert} alt="Indra Centre Expert : traitement des véhicules électriques et hybrides" className="h-20 w-20 shrink-0 object-contain" />
            <p className="text-sm leading-6 text-ink">
              Centre référencé <strong>Indra Centre Expert</strong> pour le traitement des véhicules électriques et hybrides.
            </p>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Filière 1 : réemploi */}
      <section id="reemploi" className="scroll-mt-44 bg-mist">
        <div className="container-x py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Reveal className="text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Filière 1</p>
              <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Batteries prêtes au réemploi</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-steel lg:mx-0">
                Ces batteries de traction proviennent de véhicules électriques et hybrides démontés dans notre centre de Colomiers. Elles
                peuvent être revendues et réinstallées dans un véhicule du même modèle, pour une fraction du prix d&apos;une batterie neuve.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-2.5 text-sm text-ink">
                {REUSE_POINTS.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm font-semibold text-ink">
              {result.total.toLocaleString("fr-FR")} batterie{result.total > 1 ? "s" : ""} en stock
            </p>
            {result.total > 1 && (
              <nav aria-label="Trier les batteries" className="flex gap-2 text-xs font-bold">
                {[
                  { value: undefined, label: "Plus récentes" },
                  { value: "price-asc", label: "Prix croissant" },
                  { value: "price-desc", label: "Prix décroissant" },
                ].map((o) => (
                  <a
                    key={o.label}
                    href={o.value ? `/batteries-ve?sort=${o.value}#reemploi` : "/batteries-ve#reemploi"}
                    className={`rounded-full border px-3.5 py-2 transition ${sort === o.value ? "border-brand bg-brand text-ink-900" : "border-line bg-white text-ink hover:border-brand"}`}
                  >
                    {o.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
          <div className="mt-6">
            <PartsGrid parts={result.items} emptyTitle="Aucune batterie en stock pour le moment" />
          </div>
          <Pagination page={result.page} pages={result.pages} basePath="/batteries-ve" params={{ sort }} />
          <p className="mt-6 text-center text-xs leading-5 text-steel">
            Les batteries lithium-ion sont soumises à une réglementation de transport spécifique : selon le modèle, retrait au comptoir ou
            livraison sur devis. Une question sur une référence ? Appelez-nous au{" "}
            <a href={site.phoneHref} className="font-bold text-ink">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </section>

      {/* Filière 2 : usage industriel */}
      <section id="industriel" className="grain relative scroll-mt-44 overflow-hidden bg-night text-white">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#223139_0%,#0d161b_60%)]" />
        <div className="container-x py-16 lg:py-20">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Filière 2</p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">
              Batteries à <span className="text-outline-brand">usage industriel</span>
            </h2>
            <p className="mt-5 leading-7 text-white/75">
              Certaines batteries ne peuvent plus être remontées dans un véhicule : choc lors d&apos;un accident, carter déformé, défaut
              sur un module ou sur l&apos;électronique de gestion. Pourtant, une grande partie de leurs modules sont neufs ou en bon état.
              Démontés et contrôlés, ils peuvent resservir pour un usage industriel. Nous proposons ces batteries et modules aux
              professionnels.
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {INDUSTRIAL_USES.map((u) => (
              <StaggerItem key={u.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                <p className="font-display text-2xl font-semibold uppercase leading-none text-brand-400">{u.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{u.text}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal className="space-y-5 lg:sticky lg:top-48">
              <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400">Parlons de votre projet</p>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  Les disponibilités dépendent des véhicules que nous recevons. Décrivez votre besoin : nous vous proposons les batteries et
                  modules disponibles, avec leur provenance, et organisons l&apos;enlèvement ou le transport.
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  <li>
                    <a href={site.phoneHref} className="flex items-center gap-3 font-bold text-white hover:text-brand-400">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand-400">
                        <PhoneIcon size={16} />
                      </span>
                      {site.phone}
                    </a>
                  </li>
                  <li>
                    <a href={site.smsHref} className="flex items-center gap-3 text-white/85 hover:text-brand-400">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand-400">
                        <PhoneIcon size={16} />
                      </span>
                      SMS {site.sms}
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-white/85">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand-400">
                      <PinIcon size={16} />
                    </span>
                    {site.address.street}, {site.address.postcode} {site.address.city}
                  </li>
                  <li className="flex items-center gap-3 text-white/85">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-brand-400">
                      <ClockIcon size={16} />
                    </span>
                    {site.hours}
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 p-5 text-sm leading-6 text-white/75">
                <ShieldIcon size={20} className="mt-0.5 shrink-0 text-brand-400" />
                Batteries mises en sécurité par nos équipes et remises avec la traçabilité de leur véhicule d&apos;origine.
              </div>
            </Reveal>
            <Reveal delay={0.1} className="rounded-3xl bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-8">
              <ContactForm kind="batterie" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
