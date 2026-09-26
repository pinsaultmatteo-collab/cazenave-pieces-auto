"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { photos } from "@/lib/photos";

const STEPS = [
  {
    n: "01",
    title: "Réception et dépollution",
    text: "Le véhicule hors d'usage arrive au centre, il est enregistré, dépollué et ses fluides sont collectés séparément.",
    photo: photos.depollution,
    alt: "Technicien dépolluant un véhicule sous le pont élévateur",
  },
  {
    n: "02",
    title: "Démontage et contrôle",
    text: "Chaque pièce est démontée, testée et référencée par nos équipes dans notre atelier de Colomiers.",
    photo: photos.lift,
    alt: "Véhicule sur pont élévateur en cours de démontage",
  },
  {
    n: "03",
    title: "Photo et mise en ligne",
    text: "Chaque pièce passe par notre studio photo avant d'apparaître sur le site avec son état et sa compatibilité. Stock à jour toutes les 30 minutes.",
    photo: photos.studioPart,
    alt: "Pièce photographiée dans le studio lumineux de l'atelier",
  },
  {
    n: "04",
    title: "Expédition ou retrait",
    text: "Emballage soigné et expédition sous 24/48h partout en France, ou retrait au comptoir de Colomiers. Garantie 12 mois.",
    photo: photos.counter,
    alt: "Comptoir d'accueil Cazenave Pièces Auto",
  },
] as const;

// Route ondulée au-dessus des quatre étapes (repère 1200 × 140).
const ROAD = "M0 90C150 90 200 30 330 30S480 110 610 110S760 30 890 30S1080 90 1200 90";
const MARKS = [0.13, 0.38, 0.62, 0.87];

/** Section « de l'épave à votre porte » : la route se trace au scroll. */
export function Process() {
  const ref = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const reduce = useReducedMotion();
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [lit, setLit] = useState(reduce ? MARKS.length : 0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const total = el.getTotalLength();
    setPoints(MARKS.map((f) => el.getPointAtLength(f * total)));
    if (reduce) el.style.strokeDashoffset = "0";
  }, [reduce]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    if (path.current) path.current.style.strokeDashoffset = String(1 - v);
    setLit(MARKS.filter((m) => v >= m).length);
  });

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-night text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,#223139_0%,#0d161b_60%)]" />
      <div className="container-x py-20 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Notre méthode</p>
          <h2 className="display-title mt-4 text-4xl sm:text-5xl lg:text-6xl">
            De l&apos;épave <span className="text-outline-brand">à votre porte</span>
          </h2>
          <p className="mt-5 leading-7 text-white/70">
            Depuis 1974, une seule exigence : que la pièce d&apos;occasion qui arrive chez vous soit aussi fiable
            qu&apos;une pièce neuve. Voici ce qui se passe entre les deux.
          </p>
        </Reveal>

        {/* Route (ordinateur) */}
        <div className="relative mt-16 hidden lg:block">
          <svg viewBox="0 0 1200 140" className="h-auto w-full overflow-visible" aria-hidden>
            <path d={ROAD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="18" strokeLinecap="round" />
            <path d={ROAD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="14 12" />
            <path
              ref={path}
              d={ROAD}
              pathLength={1}
              fill="none"
              stroke="#b8cf1f"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="22"
                  fill={i < lit ? "#b8cf1f" : "#16232a"}
                  stroke={i < lit ? "#b8cf1f" : "rgba(255,255,255,0.3)"}
                  strokeWidth="3"
                  style={{ transition: "fill 400ms ease, stroke 400ms ease" }}
                />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontFamily="var(--font-barlow)"
                  fontWeight="700"
                  fontSize="18"
                  fill={i < lit ? "#0d161b" : "#ffffff"}
                >
                  {STEPS[i].n}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <ol className="mt-10 grid gap-6 lg:mt-8 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <li className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors duration-500 hover:border-brand-400/60">
                <div className="relative aspect-[16/8] overflow-hidden lg:aspect-[16/10]">
                  <Image
                    src={s.photo}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 100vw"
                    placeholder="blur"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-display text-4xl font-bold text-brand-400 lg:hidden">{s.n}</span>
                </div>
                <div className="p-4 lg:p-5">
                  <h3 className="font-display text-2xl font-semibold uppercase leading-none">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65 lg:mt-3">{s.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
