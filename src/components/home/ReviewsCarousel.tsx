"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Review } from "@/lib/reviews";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@/components/icons";

const AUTOPLAY_MS = 6000;

function initials(author: string) {
  const name = author.split("·")[0].trim();
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "★";
}

function Stars({ rating, animate }: { rating: number; animate: boolean }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={animate ? { scale: 0, rotate: -45 } : false}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 380, damping: 16 }}
        >
          <StarIcon size={17} className={i < rating ? "text-brand" : "text-ink-100"} />
        </motion.span>
      ))}
    </span>
  );
}

function ReviewCard({ review, animate }: { review: Review; animate: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-brand/50 hover:shadow-2xl hover:shadow-ink/10">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-10 select-none font-display text-[10rem] leading-none text-brand-100 transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110"
      >
        &ldquo;
      </span>
      <Stars rating={review.rating} animate={animate} />
      <p className="relative mt-5 flex-1 text-[15px] leading-7 text-ink">{review.text}</p>
      <footer className="relative mt-6 flex items-center gap-3 border-t border-line pt-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-base font-semibold text-brand-400 transition-transform duration-500 group-hover:scale-110">
          {initials(review.author)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-ink">{review.author}</span>
          <span className="block text-xs text-steel">
            {review.date} · Avis {review.source}
          </span>
        </span>
      </footer>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </article>
  );
}

/**
 * Carrousel d'avis : défilement par flèches, points, glissé tactile et
 * défilement automatique (en pause au survol, au clavier et hors écran).
 */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { margin: "-20% 0px" });
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [paused, setPaused] = useState(false);
  /** Nombre de positions atteignables (avis − avis visibles + 1) */
  const [positions, setPositions] = useState(reviews.length);

  const cards = useCallback(() => Array.from(trackRef.current?.children ?? []) as HTMLElement[], []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const list = cards();
      if (!track || !list.length) return;
      const target = list[Math.max(0, Math.min(i, list.length - 1))];
      track.scrollTo({ left: target.offsetLeft - list[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
    },
    [cards, reduce],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      const atStart = track.scrollLeft <= 4;
      if (dir === 1 && atEnd) return goTo(0);
      if (dir === -1 && atStart) return goTo(positions - 1);
      goTo(index + dir);
    },
    [goTo, index, positions],
  );

  // Carte courante et bords, recalculés au défilement
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    const list = cards();
    if (!track || !list.length) return;
    const x = track.scrollLeft + list[0].offsetLeft;
    let nearest = 0;
    let best = Infinity;
    list.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setIndex(nearest);
    setEdges({ start: track.scrollLeft <= 4, end: track.scrollLeft >= track.scrollWidth - track.clientWidth - 4 });
  }, [cards]);

  // Nombre de cartes visibles selon la largeur : un point par position atteignable
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      if (!first) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const visible = Math.max(1, Math.round((track.clientWidth + gap) / (first.offsetWidth + gap)));
      setPositions(Math.max(1, reviews.length - visible + 1));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [reviews.length]);

  // Défilement automatique
  useEffect(() => {
    if (reduce || paused || !inView || reviews.length < 2) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused, inView, step, reviews.length]);

  const arrow =
    "flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-ink-900 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-95";

  return (
    <div
      ref={wrapRef}
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carrousel"
      aria-label="Avis clients"
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-4 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-2 lg:scroll-px-2 lg:px-2"
      >
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ delay: Math.min(i, 3) * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            role="group"
            aria-roledescription="avis"
            aria-label={`${i + 1} sur ${reviews.length}`}
          >
            <ReviewCard review={r} animate={!reduce} />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choisir un avis">
          {Array.from({ length: positions }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === Math.min(index, positions - 1)}
              aria-label={`Avis ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${i === Math.min(index, positions - 1) ? "w-8 bg-brand" : "w-2.5 bg-ink-100 hover:bg-steel"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Avis précédents" className={`${arrow} ${edges.start ? "opacity-60" : ""}`}>
            <ChevronLeftIcon size={22} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Avis suivants" className={`${arrow} ${edges.end ? "opacity-60" : ""}`}>
            <ChevronRightIcon size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
