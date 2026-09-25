"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { CategoryIcon } from "@/components/svg/CategoryIcons";
import { ChevronRightIcon } from "@/components/icons";

export type CategoryTile = {
  slug: string;
  name: string;
  /** Nombre de pièces en stock (0 si inconnu) */
  count: number;
  /** Photo d'une pièce réelle du stock (URL) ou photo locale de repli */
  photo: StaticImageData | string;
  /** Nom de la pièce illustrée, si photo réelle */
  photoLabel?: string;
  icon: string;
};

export function Categories({ items }: { items: CategoryTile[] }) {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
      {items.map((c) => (
        <StaggerItem key={c.slug} className="[perspective:1000px]">
          <TiltCard className="group relative h-full rounded-2xl">
            <Link
              href={`/pieces-auto/${c.slug}`}
              className="relative block h-full overflow-hidden rounded-2xl bg-night shadow-lg shadow-ink/10 ring-1 ring-black/5"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={c.photo}
                  alt={c.photoLabel ? `${c.photoLabel} d'occasion, ${c.name.toLowerCase()}` : `Pièces d'occasion : ${c.name.toLowerCase()}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  placeholder={typeof c.photo === "string" ? "empty" : "blur"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/5" />
                <span className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-brand-400 backdrop-blur-md [transform:translateZ(40px)]">
                  <CategoryIcon slug={c.icon} width={26} height={26} />
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white [transform:translateZ(30px)]">
                <div>
                  <span className="block font-display text-2xl font-semibold uppercase leading-none">{c.name}</span>
                  <span className="mt-2 block text-xs font-semibold text-brand-400">
                    {c.count > 0 ? `${c.count.toLocaleString("fr-FR")} pièce${c.count > 1 ? "s" : ""} en stock` : "Voir les pièces disponibles"}
                  </span>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-ink-900 transition-transform duration-300 group-hover:translate-x-1">
                  <ChevronRightIcon size={18} />
                </span>
              </div>
            </Link>
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
