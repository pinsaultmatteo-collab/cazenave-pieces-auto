import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLACEHOLDER_ARTICLES, PLACEHOLDER_CATEGORIES } from "@/lib/placeholders";
import { HeroSearch } from "@/components/home/HeroSearch";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-mist">
        <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
              Casse auto à Colomiers, près de Toulouse
            </p>
            <h1 className="display-title mt-3 text-4xl text-ink sm:text-5xl lg:text-6xl">
              Le spécialiste de la pièce auto d&apos;occasion depuis {site.foundedYear}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-steel sm:text-lg">
              Trouvez simplement et rapidement votre pièce auto d&apos;occasion pas cher, testée et
              garantie 12 mois. Expédition sous 24/48h partout en France, ou retrait sur place.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink">
              {["Jusqu'à 70 % moins cher que le neuf", "Pièces testées et garanties", "Centre VHU agréé"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckIcon size={18} className="text-brand" />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-100 lg:-inset-6" aria-hidden />
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ---------- Réassurance ---------- */}
      <section aria-label="Nos engagements" className="border-b border-line bg-white">
        <ul className="container-x grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {site.reassurance.map((r) => (
            <li key={r.title} className="flex items-start gap-3">
              <Image src={r.icon} alt="" unoptimized className="h-9 w-9 shrink-0" />
              <div>
                <p className="text-sm font-bold text-ink">{r.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-steel">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Catégories ---------- */}
      <section className="container-x py-14 lg:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="display-title text-2xl text-ink sm:text-3xl">Nos pièces d&apos;occasion par catégorie</h2>
            <p className="mt-2 text-steel">
              Chaque pièce est démontée, contrôlée et photographiée dans notre centre de Colomiers.
            </p>
          </div>
          <Link href="/pieces-auto" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Voir tout le stock <ChevronRightIcon size={18} />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/pieces-auto/${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand hover:shadow-md"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl font-extrabold text-brand-700">
                  {c.name.charAt(0)}
                </span>
                <span className="flex-1 text-base font-bold text-ink">{c.name}</span>
                <ChevronRightIcon className="text-steel transition group-hover:translate-x-1 group-hover:text-brand-700" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Nouveautés (alimenté par Opisto) ---------- */}
      <section className="bg-mist">
        <div className="container-x py-14 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display-title text-2xl text-ink sm:text-3xl">Dernières pièces ajoutées</h2>
              <p className="mt-2 text-steel">
                Notre stock se met à jour automatiquement toutes les 30 minutes.
              </p>
            </div>
            <Link href="/pieces-auto?tri=nouveautes" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
              Toutes les nouveautés <ChevronRightIcon size={18} />
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="aspect-[4/3] animate-pulse bg-ink-50" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-ink-50" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-ink-50" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-brand-100" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Enlèvement de véhicule ---------- */}
      <section className="container-x py-14 lg:py-20">
        <div className="grid items-center gap-8 rounded-3xl bg-ink px-6 py-10 text-white sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:px-14 lg:py-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Pour professionnels et particuliers</p>
            <h2 className="display-title mt-3 text-3xl sm:text-4xl">
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
              className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase text-ink-900 transition hover:bg-brand-600"
            >
              Faire estimer mon véhicule
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Engagement écologique ---------- */}
      <section id="engagement" className="border-t border-line">
        <div className="container-x grid gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <h2 className="display-title text-2xl text-ink sm:text-3xl">
              Bien loin de la casse auto telle qu&apos;on l&apos;imagine…
            </h2>
            <p className="mt-5 leading-7 text-steel">
              Notre centre de recyclage pour véhicules hors d&apos;usage permet le réemploi des pièces auto
              d&apos;occasion et le recyclage à près de 95 % des véhicules. Cazenave Pièces Auto est un centre
              agréé VHU par la préfecture de Haute-Garonne.
            </p>
            <p className="mt-4 leading-7 text-steel">
              Votre casse automobile de Colomiers s&apos;inscrit dans une logique d&apos;économie circulaire
              encadrée par l&apos;article R543-153 du code de l&apos;environnement :
            </p>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-ink">
              {[
                "La valorisation de la matière",
                "La transformation des déchets en matières premières secondaires",
                "Le réemploi de pièces automobiles d'occasion plutôt que l'achat de pièces neuves",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/qui-sommes-nous" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
              Découvrir Cazenave <ChevronRightIcon size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "95 %", label: "de réutilisation et de valorisation d'un véhicule hors d'usage" },
              { value: "1974", label: "année de création, une entreprise familiale à Colomiers" },
              { value: "12 mois", label: "de garantie sur toutes nos pièces d'occasion" },
              { value: "24/48h", label: "délai d'expédition partout en France" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-brand-50 p-6">
                <p className="display-title text-3xl text-brand-700 sm:text-4xl">{s.value}</p>
                <p className="mt-2 text-sm leading-5 text-ink">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Professionnels ---------- */}
      <section className="bg-ink-50">
        <div className="container-x flex flex-col items-start gap-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="display-title text-2xl text-ink sm:text-3xl">Professionnel de l&apos;automobile ?</h2>
            <p className="mt-2 max-w-2xl text-steel">
              Garages, carrossiers, concessionnaires, assureurs, fourrières : créez votre compte
              professionnel pour bénéficier de conditions dédiées et d&apos;un interlocuteur unique.
            </p>
          </div>
          <Link
            href="/espace-pro"
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-bold uppercase text-white transition hover:bg-ink-700"
          >
            Créer mon compte pro
          </Link>
        </div>
      </section>

      {/* ---------- Le Mag ---------- */}
      <section className="container-x py-14 lg:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="display-title text-2xl text-ink sm:text-3xl">Le magazine de l&apos;occasion</h2>
            <p className="mt-2 text-steel">Conseils, coulisses et actualités de votre casse auto.</p>
          </div>
          <Link href="/mag" className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Tous les articles <ChevronRightIcon size={18} />
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {PLACEHOLDER_ARTICLES.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-md">
                <div className="aspect-[16/10] bg-gradient-to-br from-ink to-ink-700" />
                <div className="p-5">
                  <h3 className="text-base font-bold leading-snug text-ink group-hover:text-brand-700">{a.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-steel">{a.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
