import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { FAQ } from "@/lib/faq";
import { categoryVisual, PLACEHOLDER_ARTICLES, PLACEHOLDER_BRANDS } from "@/lib/placeholders";
import { getCategories, getCategoryCounts, getLatestParts, isDemoData } from "@/lib/catalog";
import { PartCard } from "@/components/catalog/PartCard";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { Process } from "@/components/home/Process";
import { Stats } from "@/components/home/Stats";
import { StockBanner } from "@/components/home/StockBanner";
import { Reviews } from "@/components/home/Reviews";
import { Faq } from "@/components/home/Faq";
import { Social } from "@/components/home/Social";
import { Marquee } from "@/components/motion/Marquee";
import { ParallaxBanner } from "@/components/motion/ParallaxBanner";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ChevronRightIcon } from "@/components/icons";

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
  const [categories, counts, latest] = await Promise.all([getCategories(), getCategoryCounts(), getLatestParts(4)]);
  const demo = isDemoData();
  const categoryTiles = categories
    .filter((c) => demo || (counts[c.id] ?? 0) > 0)
    .slice(0, 9)
    .map((c) => ({ slug: c.slug, name: c.name, count: counts[c.id] ?? 0, ...categoryVisual(c.slug) }));

  return (
    <>
      <Hero />

      {/* Défilé des marques */}
      <div className="border-b border-white/10 bg-night py-5 text-white/80">
        <Marquee items={PLACEHOLDER_BRANDS} />
      </div>

      {/* Réassurance */}
      <section aria-label="Nos engagements" className="border-b border-line bg-white">
        <Stagger className="container-x grid grid-cols-2 gap-6 py-10 sm:grid-cols-3 lg:grid-cols-6" stagger={0.07}>
          {site.reassurance.map((r) => (
            <StaggerItem key={r.title} className="flex items-start gap-3">
              <Image src={r.icon} alt="" unoptimized className="h-9 w-9 shrink-0" />
              <div>
                <p className="text-sm font-bold text-ink">{r.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-steel">{r.text}</p>
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

      {/* Enlèvement de véhicule */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <ParallaxBanner
            image={photos.truck}
            alt="Camion plateau Cazenave Pièces Auto pour l'enlèvement de véhicules"
            className="rounded-3xl text-white shadow-2xl shadow-ink/20"
            overlayClassName="bg-gradient-to-r from-night/95 via-night/80 to-night/35"
            amount={60}
          >
            <div className="grid items-center gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:px-14 lg:py-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Pour professionnels et particuliers</p>
                <h2 className="display-title mt-4 text-4xl sm:text-5xl">
                  Nous rachetons votre véhicule et vous en débarrassons gratuitement*
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-white/80">
                  Vous ne savez pas quoi faire de votre vieille voiture ? Vous changez de véhicule et souhaitez
                  bénéficier de la prime à la casse ? Nous rachetons votre véhicule : faites-le estimer auprès de
                  nos services. Véhicule stationné sur la voie publique et menacé d&apos;amende ? À réception du
                  dossier complet, nous nous occupons de tout.
                </p>
                <p className="mt-3 text-xs text-white/50">
                  * Sous conditions. Contactez nos services pour savoir si vous êtes éligible à l&apos;enlèvement
                  gratuit. Intervention en régions Occitanie et Nouvelle-Aquitaine.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <Link
                  href="/enlevement-vehicule"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_40px_rgba(152,174,7,0.45)]"
                >
                  Faire estimer mon véhicule
                </Link>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-night/40 px-8 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  {site.phone}
                </a>
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
