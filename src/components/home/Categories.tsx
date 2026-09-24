"use client";

import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { CategoryIcon } from "@/components/svg/CategoryIcons";
import { ChevronRightIcon } from "@/components/icons";
import { PLACEHOLDER_CATEGORIES } from "@/lib/placeholders";

export function Categories() {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
      {PLACEHOLDER_CATEGORIES.map((c, i) => (
        <StaggerItem key={c.slug} className="[perspective:1000px]">
          <TiltCard className="group relative h-full rounded-2xl">
            <Link
              href={`/pieces-auto/${c.slug}`}
              className="relative flex h-full items-center gap-5 overflow-hidden rounded-2xl border border-line bg-white p-5 transition-colors duration-300 hover:border-brand-200"
            >
              <span
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink text-brand-400 transition-transform duration-500 [transform:translateZ(30px)] group-hover:scale-110">
                <CategoryIcon slug={c.slug} width={32} height={32} />
              </span>
              <span className="relative flex-1 [transform:translateZ(20px)]">
                <span className="block font-display text-2xl font-semibold uppercase leading-none text-ink">{c.name}</span>
                <span className="mt-1.5 block text-xs font-semibold text-steel">Voir les pièces disponibles</span>
              </span>
              <ChevronRightIcon className="relative text-steel transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-700" />
              <span className="sr-only">{String(i + 1).padStart(2, "0")}</span>
            </Link>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
