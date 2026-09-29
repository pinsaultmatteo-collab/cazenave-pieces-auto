import Image from "next/image";
import Link from "next/link";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/motion/Reveal";
import { EvExpertiseGrid } from "@/components/ev/EvExpertise";
import { BoltIcon, ChevronRightIcon } from "@/components/icons";
import certIndraExpert from "@/assets/brand/cert-indra-expert.jpg";

/**
 * Accueil : mise en avant de l'expertise véhicules électriques et accès à
 * la page Batteries VE, avec le nombre de batteries de traction en stock.
 */
export function EvBlock({ batteries }: { batteries: number }) {
  return (
    <section aria-labelledby="ev-title" className="container-x pb-20 lg:pb-28">
      {/* Hauteur de photo fixe sur mobile (pas d'aspect-ratio sur une case de grille : Safari la calcule mal). */}
      <Reveal className="grid grid-cols-1 overflow-hidden rounded-3xl border border-line bg-mist lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="relative h-64 min-w-0 sm:h-80 lg:h-auto lg:min-h-[28rem]">
          <Image
            src={photos.evBattery}
            alt="Batterie de véhicule électrique démontée dans l'atelier de Colomiers"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholder="blur"
            className="object-cover object-[center_60%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent" />
          <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-white/95 p-2 pr-4 shadow-lg backdrop-blur sm:left-5 sm:top-5">
            <Image src={certIndraExpert} alt="" className="h-11 w-11 shrink-0 object-contain" />
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-steel">Référencé</span>
              <span className="block text-sm font-bold text-ink">Indra Centre Expert</span>
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white sm:inset-x-5 sm:bottom-5">
            <p>
              <span className="display-title block text-5xl text-brand-400">3 ans</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">d&apos;expertise VE</span>
            </p>
            {batteries > 0 && (
              <p className="shrink-0 rounded-full border border-white/20 bg-night/60 px-3.5 py-2 text-xs font-bold backdrop-blur">
                <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-brand-400 align-middle" />
                {batteries} batterie{batteries > 1 ? "s" : ""} en stock
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 p-6 text-center sm:p-10 lg:p-12 lg:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-700 sm:tracking-[0.3em] lg:justify-start">
            <BoltIcon size={16} className="shrink-0" /> Véhicules électriques et hybrides
          </p>
          <h2 id="ev-title" className="display-title mt-3 text-4xl text-ink sm:text-5xl">
            Votre centre expert <span className="text-brand-700">VE</span> près de Toulouse
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-steel lg:mx-0">
            Nous traitons les véhicules électriques et hybrides avec un équipement et une équipe dédiés. Leurs batteries ont une seconde
            vie : revendues pour être remontées dans un autre véhicule, ou valorisées pour un usage industriel.
          </p>
          <EvExpertiseGrid className="mt-8 text-left" />
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/batteries-ve"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700 sm:w-auto sm:px-7"
            >
              Découvrir nos batteries VE <ChevronRightIcon size={18} />
            </Link>
            <Link href="/batteries-ve#industriel" className="text-sm font-bold text-brand-700 hover:underline">
              Batteries à usage industriel
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
