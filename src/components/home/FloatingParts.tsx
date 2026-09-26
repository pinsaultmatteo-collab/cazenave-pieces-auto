"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";

export type FloatingPart = {
  key: string;
  label: string;
  count: number;
  photo: string;
  href: string;
};

/** Disposition des six cartes sur la scène (en % de la largeur et de la hauteur), rotation et profondeur. */
const LAYOUT = [
  { left: 1, top: 18, rotate: -7, depth: 1.0, width: 19 },
  { left: 19, top: 2, rotate: 4, depth: 0.6, width: 17 },
  { left: 36, top: 26, rotate: -3, depth: 1.3, width: 20 },
  { left: 56, top: 0, rotate: 6, depth: 0.7, width: 18 },
  { left: 71, top: 24, rotate: -5, depth: 1.1, width: 19 },
  { left: 86, top: 6, rotate: 3, depth: 0.5, width: 14 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Pièces réelles du stock qui flottent sous le titre : cartes photo
 * inclinées, parallaxe à la souris, redressement au survol, chacune
 * menant au catalogue filtré.
 */
export function FloatingParts({ parts }: { parts: FloatingPart[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const items = parts.slice(0, LAYOUT.length);

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative">
      {/* Ordinateur : scène libre */}
      <div className="relative hidden h-[300px] sm:block lg:h-[340px]">
        {items.map((p, i) => (
          <Card key={p.key} part={p} layout={LAYOUT[i]} index={i} sx={sx} sy={sy} reduce={!!reduce} />
        ))}
      </div>
      {/* Mobile : grille simple */}
      <ul className="grid grid-cols-2 gap-3 sm:hidden">
        {items.slice(0, 4).map((p) => (
          <li key={p.key}>
            <Link href={p.href} className="block overflow-hidden rounded-2xl bg-white text-ink shadow-lg shadow-black/30">
              <span className="relative block aspect-[4/3]">
                <Image src={p.photo} alt={p.label} fill sizes="45vw" className="object-cover" />
              </span>
              <span className="block px-3 py-2">
                <span className="block font-display text-lg font-semibold uppercase leading-none">{p.label}</span>
                <span className="mt-1 block text-[11px] font-semibold text-brand-700">{p.count.toLocaleString("fr-FR")} en stock</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({
  part,
  layout,
  index,
  sx,
  sy,
  reduce,
}: {
  part: FloatingPart;
  layout: (typeof LAYOUT)[number];
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean;
}) {
  // Les cartes « proches » (profondeur élevée) bougent davantage avec la souris.
  const x = useTransform(sx, (v) => v * 18 * layout.depth);
  const y = useTransform(sy, (v) => v * 12 * layout.depth);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${layout.left}%`, top: `${layout.top}%`, width: `${layout.width}%`, x: reduce ? 0 : x, y: reduce ? 0 : y, zIndex: Math.round(layout.depth * 10) }}
      initial={reduce ? false : { opacity: 0, y: 40, rotate: layout.rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate: layout.rotate }}
      transition={{ delay: 0.9 + index * 0.12, duration: 0.9, ease: EASE }}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.06, zIndex: 30, transition: { duration: 0.35, ease: EASE } }}
    >
      <Link
        href={part.href}
        title={`${part.label} : ${part.count.toLocaleString("fr-FR")} pièces en stock`}
        className="group block overflow-hidden rounded-2xl bg-white text-ink shadow-2xl shadow-black/40 ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(184,207,31,0.35)]"
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-mist">
          <Image src={part.photo} alt={part.label} fill sizes="(min-width: 1024px) 20vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </span>
        <span className="flex items-end justify-between gap-2 px-3 py-2.5">
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold uppercase leading-none">{part.label}</span>
            <span className="mt-1 block text-[11px] font-semibold text-brand-700">{part.count.toLocaleString("fr-FR")} en stock</span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-ink-900 transition-transform duration-300 group-hover:translate-x-0.5">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 6 6 6-6 6" />
            </svg>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
