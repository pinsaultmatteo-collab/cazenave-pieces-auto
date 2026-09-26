"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CarLineArt } from "@/components/svg/CarLineArt";

export type Hotspot = {
  key: string;
  label: string;
  href: string;
  count: number;
  /** Position dans le repère du dessin (720 × 320) */
  x: number;
  y: number;
};

/**
 * Voiture en tracé avec points chauds : chaque point désigne une pièce,
 * affiche le nombre d'exemplaires en stock et mène au catalogue filtré.
 */
export function CarHotspots({ hotspots }: { hotspots: Hotspot[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <CarLineArt className="h-auto w-full" />
      <ul className="absolute inset-0" aria-label="Pièces disponibles sur ce véhicule">
        {hotspots.map((h, i) => {
          const open = active === h.key;
          const left = `${(h.x / 720) * 100}%`;
          const top = `${(h.y / 320) * 100}%`;
          const tooltipRight = h.x > 420;
          return (
            <motion.li
              key={h.key}
              className="absolute"
              style={{ left, top }}
              initial={reduce ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduce ? 0 : 2.3 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={h.href}
                aria-label={`${h.label} : ${h.count.toLocaleString("fr-FR")} pièces en stock`}
                onMouseEnter={() => setActive(h.key)}
                onMouseLeave={() => setActive((v) => (v === h.key ? null : v))}
                onFocus={() => setActive(h.key)}
                onBlur={() => setActive((v) => (v === h.key ? null : v))}
                className="group relative block h-7 w-7 -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <span aria-hidden className="absolute inset-0 rounded-full bg-brand-400/40 animate-ping motion-reduce:animate-none" />
                <span
                  aria-hidden
                  className={`absolute inset-1.5 rounded-full border-2 border-night bg-brand-400 shadow-[0_0_14px_rgba(184,207,31,0.9)] transition-transform duration-300 ${
                    open ? "scale-125" : "group-hover:scale-125"
                  }`}
                />
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-night/95 px-3 py-2 text-left shadow-xl shadow-black/40 backdrop-blur transition-all duration-200 ${
                    tooltipRight ? "right-full mr-3" : "left-full ml-3"
                  } ${open ? "translate-x-0 opacity-100" : tooltipRight ? "translate-x-1 opacity-0" : "-translate-x-1 opacity-0"}`}
                >
                  <span className="block font-display text-lg font-semibold uppercase leading-none text-white">{h.label}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-brand-400">
                    {h.count > 0 ? `${h.count.toLocaleString("fr-FR")} en stock · voir` : "Voir les pièces"}
                  </span>
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
