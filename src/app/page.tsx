import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLACEHOLDER_ARTICLES, PLACEHOLDER_BRANDS } from "@/lib/placeholders";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { Process } from "@/components/home/Process";
import { Stats } from "@/components/home/Stats";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ChevronRightIcon } from "@/components/icons";

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

export default function HomePage() {
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
            <Categories />
          </div>
        </div>
      </section>

      <Process />

      <Stats />

      {/* Enlèvement de véhicule */}
      <section className="container-x pb-20 lg:pb-28">
        <Reveal>
          <div className="grain relative isolate grid items-center gap-8 overflow-hidden rounded-3xl bg-ink px-6 py-12 text-white sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:px-14 lg:py-16">
            <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 animate-blob rounded-full bg-brand/30 blur-3xl motion-reduce:animate-none" />
            <div aria-hidden className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 animate-blob rounded-full bg-brand/15 blur-3xl [animation-delay:-9s] motion-reduce:animate-none" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Pour professionnels et particuliers</p>
              <h2 className="display-title mt-4 text-4xl sm:text-5xl">
                Nous rachetons votre véhicule et vous en débarrassons gratuitement*
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/75">
                Vous ne savez pas quoi faire de votre vieille voiture ? Vous changez de véhicule et souhaitez
                bénéficier de la prime à la casse ? Nous rachetons votre véhicule : faites-le estimer auprès de
                nos services. Véhicule stationné sur la voie publique et menacé d&apos;amende ? À réception du
                dossier complet, nous nous occupons de tout.
              </p>
              <p className="mt-3 text-xs text-white/45">
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
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {site.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Nouveautés (alimenté par Opisto) */}
      <section className="bg-mist">
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
            {Array.from({ length: 4 }).map((_, i) => (
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

      {/* Professionnels */}
      <section className="border-b border-line">
        <Reveal className="container-x flex flex-col items-start gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Espace pro</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Professionnel de l&apos;automobile ?</h2>
            <p className="mt-3 max-w-2xl text-steel">
              Garages, carrossiers, concessionnaires, assureurs, fourrières : créez votre compte professionnel
              pour bénéficier de conditions dédiées et d&apos;un interlocuteur unique.
            </p>
          </div>
          <Link
            href="/espace-pro"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700"
          >
            Créer mon compte pro
          </Link>
        </Reveal>
      </section>

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
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-ink to-night">
                  <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 font-display text-lg font-semibold text-brand-400 backdrop-blur">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand/30 blur-3xl transition-transform duration-700 group-hover:scale-150" />
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
