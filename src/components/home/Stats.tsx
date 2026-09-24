"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, useSpring } from "motion/react";
import { SpeedGauge } from "@/components/svg/SpeedGauge";
import { Counter } from "@/components/motion/Counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";

const FIGURES = [
  { to: 52, suffix: " ans", label: "d'expérience, une entreprise familiale à Colomiers" },
  { to: 95, suffix: " %", label: "de réutilisation et de valorisation d'un véhicule hors d'usage" },
  { to: 12, suffix: " mois", label: "de garantie sur toutes nos pièces d'occasion" },
  { to: 30, suffix: " min", label: "entre deux mises à jour du stock en ligne" },
] as const;

const COMMITMENTS = [
  "La valorisation de la matière",
  "La transformation des déchets en matières premières secondaires",
  "Le réemploi de pièces d'occasion plutôt que l'achat de pièces neuves",
];

/** Engagement écologique : compteur piloté par le scroll et chiffres animés. */
export function Stats() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 45%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.8 });

  return (
    <section ref={ref} id="engagement" className="container-x grid items-center gap-12 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
      <Reveal className="relative mx-auto w-full max-w-md">
        <div aria-hidden className="absolute inset-0 -z-10 rounded-full bg-brand-100 blur-3xl" />
        <SpeedGauge progress={progress} className="h-auto w-full drop-shadow-xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center">
          <p className="display-title text-5xl text-ink sm:text-6xl">
            <Counter to={95} suffix=" %" />
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-steel">de valorisation</p>
        </div>
      </Reveal>

      <div>
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Notre engagement écologique</p>
          <h2 className="display-title mt-4 text-4xl text-ink sm:text-5xl">
            Bien loin de la casse auto telle qu&apos;on l&apos;imagine
          </h2>
          <p className="mt-5 leading-7 text-steel">
            Notre centre de recyclage pour véhicules hors d&apos;usage permet le réemploi des pièces auto
            d&apos;occasion et le recyclage à près de 95 % des véhicules. Cazenave Pièces Auto est un centre agréé
            VHU par la préfecture de Haute-Garonne, dans une logique d&apos;économie circulaire encadrée par
            l&apos;article R543-153 du code de l&apos;environnement.
          </p>
          <ul className="mt-5 space-y-2 text-sm font-semibold text-ink">
            {COMMITMENTS.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 gap-4" stagger={0.1}>
          {FIGURES.map((f) => (
            <StaggerItem key={f.label} className="rounded-2xl border border-line bg-mist p-5">
              <p className="display-title text-4xl text-brand-700 sm:text-5xl">
                <Counter to={f.to} suffix={f.suffix} />
              </p>
              <p className="mt-2 text-sm leading-5 text-ink">{f.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <Link href="/qui-sommes-nous" className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Découvrir Cazenave <ChevronRightIcon size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
