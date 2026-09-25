"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export function ProductGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const list = photos.length > 0 ? photos : [];

  if (list.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-mist text-sm text-steel">Photos à venir</div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist shadow-xl shadow-ink/10">
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
        <span className="absolute bottom-3 right-3 rounded-full bg-night/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          {index + 1} / {list.length}
        </span>
      </div>
      {list.length > 1 && (
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
