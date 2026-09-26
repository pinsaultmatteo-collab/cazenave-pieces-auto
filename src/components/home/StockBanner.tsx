"use client";

import Image from "next/image";
import Link from "next/link";
import { ParallaxBanner } from "@/components/motion/ParallaxBanner";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { CheckIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";
import { photos } from "@/lib/photos";

const POINTS = [
  "Studio photo intégré : chaque pièce est photographiée sous plusieurs angles",
  "Pièces étiquetées, référencées et rattachées à leur véhicule d'origine",
  "Stock en ligne mis à jour toutes les 30 minutes",
  "Retrait au comptoir ou expédition sous 24/48h",
];

const GALLERY = [
  { photo: photos.cagesRed, alt: "Cages de pièces de carrosserie", className: "-left-4 top-4 w-[66%] -rotate-6" },
  { photo: photos.aisleWide, alt: "Allée de rayonnages", className: "-right-4 top-0 w-[54%] rotate-3" },
  { photo: photos.tyres, alt: "Rayonnage de pneus", className: "-bottom-2 left-[24%] w-[56%] rotate-2" },
];

/** Bloc « Notre stock » : allée de moteurs en fond, arguments et mosaïque photo. */
export function StockBanner() {
  return (
    <ParallaxBanner
      image={photos.engines}
      alt="Allée de moteurs et de boîtes de vitesses en rayon"
      className="text-white"
      overlayClassName="bg-gradient-to-r from-night/92 via-night/78 to-night/45"
      amount={110}
    >
      <div className="container-x grid items-center gap-14 py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-32">
        <Reveal className="text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Notre stock</p>
          <h2 className="display-title mt-4 text-5xl sm:text-6xl lg:text-7xl">
            Chaque pièce <span className="text-outline-brand">a sa place</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/80 lg:mx-0">
            Des kilomètres de rayonnages, des moteurs aux rétroviseurs. Ce que vous voyez sur le site est
            exactement ce qui vous attend en rayon à Colomiers.
          </p>
          <ul className="mt-7 space-y-3">
            {POINTS.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left text-sm font-semibold backdrop-blur-sm"
              >
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand-400" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/pieces-auto"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400"
            >
              Explorer le stock <ChevronRightIcon size={18} />
            </Link>
            <a
              href="#recherche"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-night/40 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              <SearchIcon size={18} /> Rechercher par plaque
            </a>
          </div>
        </Reveal>

        <Stagger className="relative hidden aspect-[5/4] lg:block [perspective:1200px]" stagger={0.15}>
          {GALLERY.map((g) => (
            <StaggerItem key={g.alt} className={`absolute ${g.className}`}>
              <TiltCard className="relative rounded-2xl" max={7}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-white/90 shadow-2xl shadow-black/50">
                  <Image src={g.photo} alt={g.alt} fill sizes="36vw" placeholder="blur" className="object-cover" />
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </ParallaxBanner>
  );
}
