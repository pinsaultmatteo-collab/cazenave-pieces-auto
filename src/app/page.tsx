import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { FAQ } from "@/lib/faq";
import { CATEGORY_COVERS, categoryVisual, PLACEHOLDER_ARTICLES } from "@/lib/placeholders";
import { getBrandCounts, getBrands, getCategories, getCategoryCounts, getCategoryShowcase, getHotspotCounts, getHotspotSamples, getLatestParts, isDemoData } from "@/lib/catalog";
import { PartCard } from "@/components/catalog/PartCard";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { Process } from "@/components/home/Process";
import { Stats } from "@/components/home/Stats";
import { StockBanner } from "@/components/home/StockBanner";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { Social } from "@/components/home/Social";
import { ParallaxBanner } from "@/components/motion/ParallaxBanner";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CheckIcon, ChevronRightIcon, PhoneIcon, ShieldIcon, TruckIcon } from "@/components/icons";

/** Rendu mis en cache et rafraîchi au plus toutes les 30 minutes (stock synchronisé depuis Opisto). */
export const revalidate = 1800;

function SectionHeading({ kicker, title, text, href, link }: { kicker: string; title: string; text: string; href: string; link: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">{kicker}</p>
        <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">{title}</h2>
        <p className="mt-3 max-w-xl text-steel">{text}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
        {link} <ChevronRightIcon size={18} />
      </Link>
    </div>
  );
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.flatMap((g) =>
    g.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  ),
};

export default async function HomePage() {
  const [categories, counts, latest, showcase, brands, brandCounts, hotspotCounts, hotspotSamples] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    getLatestParts(4),
    getCategoryShowcase(),
    getBrands(),
    getBrandCounts(),
    getHotspotCounts(),
    getHotspotSamples(),
  ]);
  // Cartes de pièces réelles du hero : une photo récente par famille de pièce, avec le nombre en stock
  const heroParts = [
    { key: "moteur", label: "Moteur", href: "/pieces-auto?categorie=moteur" },
    { key: "phare", label: "Phare avant", href: "/pieces-auto?q=optique+avant" },
    { key: "retroviseur", label: "Rétroviseur", href: "/pieces-auto?q=retroviseur" },
    { key: "boite", label: "Boîte de vitesses", href: "/pieces-auto?categorie=boite-de-vitesses" },
    { key: "porte", label: "Porte avant", href: "/pieces-auto?q=porte+avant" },
    { key: "feu-arriere", label: "Feu arrière", href: "/pieces-auto?q=feu+arriere" },
    { key: "capot", label: "Capot", href: "/pieces-auto?categorie=capot" },
    { key: "pare-chocs", label: "Pare-chocs avant", href: "/pieces-auto?q=pare+choc+avant" },
  ]
    .filter((h) => hotspotSamples[h.key])
    .map((h) => ({ ...h, count: hotspotCounts[h.key] ?? 0, photo: hotspotSamples[h.key].photo }))
    .slice(0, 6);
  const marqueeBrands = brands
    .map((b) => ({ slug: b.slug, name: b.name, count: brandCounts[b.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const demo = isDemoData();
  const categoryTiles = categories
    .filter((c) => demo || (counts[c.id] ?? 0) > 0)
    .slice(0, 9)
    .map((c) => {
      const visual = categoryVisual(c.slug);
      const cover = CATEGORY_COVERS[c.slug];
      const shot = cover ? undefined : showcase[c.id];
      return { slug: c.slug, name: c.name, count: counts[c.id] ?? 0, icon: visual.icon, photo: cover ?? shot?.photo ?? visual.photo, photoLabel: shot?.name };
    });

  return (
    <>
      <Hero parts={heroParts} />

      {/* Défilé des marques en stock, logo et nom, dans l'ordre du nombre de pièces */}
      <BrandsMarquee brands={marqueeBrands} />

      {/* Réassurance */}
      <section aria-label="Nos engagements" className="border-b border-line bg-white">
        <Stagger className="container-x grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6" stagger={0.07}>
          {site.reassurance.map((r) => (
            <StaggerItem key={r.title}>
              <div className="group -m-3 flex items-start gap-3 rounded-2xl p-3 transition duration-300 hover:-translate-y-1 hover:bg-mist hover:shadow-lg hover:shadow-ink/10">
                <span className="relative shrink-0">
                  <span aria-hidden className="absolute inset-0 scale-75 rounded-full bg-brand/25 opacity-0 blur-md transition duration-500 group-hover:scale-150 group-hover:opacity-100" />
                  <Image
                    src={r.icon}
                    alt=""
                    unoptimized
                    className="relative h-9 w-9 transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-125"
                  />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink transition-colors group-hover:text-brand-700">{r.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-steel">{r.text}</p>
                  <span aria-hidden className="mt-1.5 block h-0.5 w-0 rounded-full bg-brand transition-all duration-500 group-hover:w-10" />
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Catégories */}
      <section className="bg-mist">
        <div className="container-x py-20 lg:py-28">
          <Reveal>
            <SectionHeading
              kicker="Le catalogue"
              title="Nos pièces d'occasion par catégorie"
              text="Chaque pièce est démontée, contrôlée et photographiée dans notre centre de Colomiers."
              href="/pieces-auto"
              link="Voir tout le stock"
            />
          </Reveal>
          <div className="mt-10">
            <Categories items={categoryTiles} />
          </div>
        </div>
      </section>

      {/* Nouveautés (alimenté par Opisto) */}
      <section className="border-t border-line bg-white">
        <div className="container-x py-20 lg:py-28">
          <Reveal>
            <SectionHeading
              kicker="Arrivages"
              title="Dernières pièces ajoutées"
              text="Notre stock se met à jour automatiquement toutes les 30 minutes."
              href="/pieces-auto?tri=nouveautes"
              link="Toutes les nouveautés"
            />
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {latest.length > 0
              ? latest.map((part) => (
                  <StaggerItem key={part.id}>
                    <PartCard part={part} />
                  </StaggerItem>
                ))
              : Array.from({ length: 4 }).map((_, i) => (
                  <StaggerItem key={i} className="overflow-hidden rounded-2xl border border-line bg-white" aria-busy="true">
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
                      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent motion-reduce:animate-none" />
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-3/4 rounded bg-ink-50" />
                      <div className="h-3 w-1/2 rounded bg-ink-50" />
                      <div className="h-6 w-1/3 rounded bg-brand-100" />
                    </div>
                  </StaggerItem>
                ))}
          </Stagger>
        </div>
      </section>

      <Process />

      <StockBanner />

      <Stats />

      {/* Enlèvement de véhicule : encart un peu plus large que la colonne de contenu */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal className="lg:-mx-4 xl:-mx-12 2xl:-mx-16">
          <ParallaxBanner
            image={photos.truck}
            alt="Camion plateau Cazenave Pièces Auto pour l'enlèvement de véhicules"
            className="rounded-3xl text-white shadow-2xl shadow-ink/20"
            overlayClassName="bg-gradient-to-r from-night/95 via-night/85 to-night/50"
            amount={60}
          >
            <div className="grid gap-8 px-6 py-9 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-12 lg:px-12 lg:py-10">
              <div>
                <p className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
                  Enlèvement de véhicule
                  <span className="rounded-full bg-brand px-2.5 py-1 text-[10px] tracking-[0.2em] text-ink-900">Gratuit*</span>
                </p>
                <h2 className="display-title mt-3 text-4xl sm:text-5xl">
                  Nous rachetons votre véhicule <span className="text-brand-400">et vous en débarrassons</span>
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/80">
                  Voiture hors d&apos;usage, accidentée, en panne ou simplement en fin de vie : nous venons la
                  chercher avec notre camion plateau, nous la rachetons si elle a de la valeur et nous prenons en
                  charge toutes les démarches. Particuliers comme professionnels.
                </p>

                <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { n: "1", title: "Estimation", text: "Décrivez votre véhicule, nous vous répondons sous 24h ouvrées avec une offre de reprise." },
                    { n: "2", title: "Enlèvement", text: "Rendez-vous à votre domicile ou sur le lieu de stationnement, en Occitanie et Nouvelle-Aquitaine." },
                    { n: "3", title: "Démarches", text: "Certificat de cession et de destruction, déclaration en préfecture : nous nous occupons de tout." },
                  ].map((s) => (
                    <li key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
                      <p className="flex items-center gap-2 font-bold">
                        <span className="font-display text-2xl font-semibold text-brand-400">{s.n}</span> {s.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-5 text-white/70">{s.text}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/enlevement-vehicule"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_40px_rgba(152,174,7,0.45)]"
                  >
                    Faire estimer mon véhicule <ChevronRightIcon size={18} />
                  </Link>
                  <a
                    href={site.phoneHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-night/40 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    <PhoneIcon size={18} className="text-brand-400" /> {site.phone}
                  </a>
                </div>
                <p className="mt-3 text-xs text-white/50">
                  * Sous conditions : véhicule complet et dossier administratif à jour. Contactez-nous pour vérifier votre éligibilité.
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-night/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-400">Ce que nous prenons en charge</p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {[
                    { icon: TruckIcon, text: "Déplacement avec notre camion plateau, véhicule roulant ou non" },
                    { icon: CheckIcon, text: "Rachat au meilleur prix des véhicules réparables ou valorisables" },
                    { icon: ShieldIcon, text: "Certificat de destruction officiel : votre responsabilité est levée" },
                    { icon: CheckIcon, text: "Prime à la conversion : nous fournissons les justificatifs" },
                    { icon: CheckIcon, text: "Véhicule sur la voie publique menacé d'amende : intervention rapide" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-400">
                        <Icon size={14} />
                      </span>
                      <span className="text-[13px] leading-5 text-white/85">{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-around gap-3 border-t border-white/10 pt-4">
                  <div className="text-center">
                    <p className="font-display text-3xl font-semibold text-brand-400">24h</p>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">pour une offre</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="font-display text-3xl font-semibold text-brand-400">0 €</p>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">de frais d&apos;enlèvement*</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="font-display text-3xl font-semibold text-brand-400">VHU</p>
                    <p className="text-[11px] uppercase tracking-wide text-white/60">centre agréé</p>
                  </div>
                </div>
              </div>
            </div>
          </ParallaxBanner>
        </Reveal>
      </section>

      <Reviews />

      {/* Professionnels */}
      <section className="border-b border-line">
        <div className="container-x grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Espace pro</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Professionnel de l&apos;automobile ?</h2>
            <p className="mt-4 max-w-xl leading-7 text-steel">
              Garages, carrossiers, concessionnaires, assureurs, fourrières : créez votre compte professionnel
              pour bénéficier de conditions dédiées et d&apos;un interlocuteur unique, au comptoir comme en ligne.
            </p>
            <Link
              href="/espace-pro"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700"
            >
              Créer mon compte pro
            </Link>
          </Reveal>
          <Reveal delay={0.15} className="relative">
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-100" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-xl shadow-ink/10">
              <Image
                src={photos.counter}
                alt="Comptoir d'accueil des professionnels chez Cazenave Pièces Auto"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Faq />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Social />

      {/* Le Mag */}
      <section className="container-x py-20 lg:py-28">
        <Reveal>
          <SectionHeading
            kicker="Le Mag"
            title="Le magazine de l'occasion"
            text="Conseils, coulisses et actualités de votre casse auto."
            href="/mag"
            link="Tous les articles"
          />
        </Reveal>
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3" stagger={0.1}>
          {PLACEHOLDER_ARTICLES.map((a, i) => (
            <StaggerItem key={a.href}>
              <Link
                href={a.href}
                className="group block h-full overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={a.photo}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-display text-lg font-semibold text-brand-400 backdrop-blur">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-2xl font-semibold uppercase leading-none text-ink transition-colors group-hover:text-brand-700">{a.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-steel">{a.excerpt}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
