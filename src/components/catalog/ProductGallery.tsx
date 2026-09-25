"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

/** Galerie photo d'une fiche : image principale, flèches, clavier et vignettes. */
export function ProductGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const list = photos.length > 0 ? photos : [];
  const count = list.length;

  const go = useCallback((delta: number) => setIndex((i) => (count ? (i + delta + count) % count : 0)), [count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-mist text-sm text-steel">Photos à venir</div>
    );
  }

  const arrowClass =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg shadow-black/20 backdrop-blur transition hover:bg-brand hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

  return (
    <div>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist shadow-xl shadow-ink/10 focus:outline-none"
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
        aria-roledescription="galerie"
        aria-label={`Photos : ${alt}`}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={list[index]}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image src={list[index]} alt={`${alt} · photo ${index + 1}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className={`${arrowClass} left-3`}>
              <ChevronLeftIcon size={22} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className={`${arrowClass} right-3`}>
              <ChevronRightIcon size={22} />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-night/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          {index + 1} / {count}
        </span>
      </div>
      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((p, i) => (
            <li key={`${p}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Voir la photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-20 w-24 overflow-hidden rounded-xl border-2 transition ${i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <Image src={p} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
