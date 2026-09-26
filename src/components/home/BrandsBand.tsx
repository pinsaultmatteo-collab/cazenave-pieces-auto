"use client";

import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ChevronRightIcon } from "@/components/icons";

export type BrandChip = { slug: string; name: string; count: number };

type Props = {
  brands: BrandChip[];
  totalBrands: number;
  totalParts: number;
};

/**
 * Bande « toutes marques » sous le hero : chiffres réels du stock et les
 * marques les plus fournies présentées comme des plaques d'immatriculation.
 */
export function BrandsBand({ brands, totalBrands, totalParts }: Props) {
  return (
    <section aria-label="Marques en stock" className="relative overflow-hidden border-b border-white/10 bg-night text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(152,174,7,0.16),transparent_55%)]" />
      <div className="container-x relative grid gap-8 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:items-center lg:gap-14 lg:py-12">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Toutes marques</p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-6xl font-semibold leading-none sm:text-7xl">{totalBrands}</span>
            <span className="font-display text-2xl font-semibold uppercase leading-none text-white/80 sm:text-3xl">marques en rayon</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {totalParts.toLocaleString("fr-FR")} pièces d&apos;occasion disponibles aujourd&apos;hui, du moteur au rétroviseur. Stock mis à
            jour toutes les 30 minutes.
          </p>
          <Link href="/pieces-auto/marques" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-400 hover:underline">
            Voir toutes les marques <ChevronRightIcon size={16} />
          </Link>
        </Reveal>

        <Stagger className="flex flex-wrap gap-2.5 lg:justify-end" stagger={0.04}>
          {brands.map((b) => (
            <StaggerItem key={b.slug}>
              <Link
                href={`/pieces-auto/marques/${b.slug}`}
                title={`${b.count.toLocaleString("fr-FR")} pièces ${b.name}`}
                className="group flex h-11 items-stretch overflow-hidden rounded-md border border-white/20 bg-white text-ink shadow-md shadow-black/30 transition duration-300 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[0_8px_30px_rgba(184,207,31,0.35)]"
              >
                <span className="flex w-7 items-center justify-center bg-[#0b2a8a] font-display text-sm font-semibold text-white">
                  {b.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex items-center gap-2 px-3">
                  <span className="font-display text-xl font-semibold uppercase leading-none tracking-wide">{b.name}</span>
                  <span className="rounded-sm bg-mist px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-steel group-hover:bg-brand-50 group-hover:text-brand-700">
                    {b.count.toLocaleString("fr-FR")}
                  </span>
                </span>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem>
            <Link
              href="/pieces-auto/marques"
              className="flex h-11 items-center gap-1 rounded-md border border-dashed border-white/30 px-3 text-sm font-bold text-white/80 transition hover:border-brand-400 hover:text-brand-400"
            >
              + {Math.max(0, totalBrands - brands.length)} autres marques
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
