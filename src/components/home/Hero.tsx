"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { HeroSearch } from "./HeroSearch";
import { CarLineArt } from "@/components/svg/CarLineArt";
import { CheckIcon } from "@/components/icons";
import { EASE } from "@/components/motion/Reveal";

const LINES: { words: string[]; accent?: "brand" | "outline" }[] = [
  { words: ["Le", "spécialiste"] },
  { words: ["de", "la", "pièce", "auto"] },
  { words: ["d'occasion"], accent: "brand" },
  { words: ["depuis", "1974"], accent: "outline" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "0.7em", rotateX: -50 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, ease: EASE } },
};

const ARGUMENTS = ["Jusqu'à 70 % moins cher que le neuf", "Pièces testées et garanties 12 mois", "Centre VHU agréé"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const carX = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -420]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);

  return (
    <section ref={ref} className="grain relative isolate overflow-hidden bg-night text-white">
      {/* Fond : dégradé, halos lumineux, grille 3D */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_left,#2b3d47_0%,#16232a_45%,#0d161b_100%)]"
      />
      <motion.div aria-hidden style={{ y: glowY }} className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] animate-blob rounded-full bg-brand/25 blur-3xl motion-reduce:animate-none" />
        <div className="absolute right-[-10rem] top-1/4 h-[26rem] w-[26rem] animate-blob rounded-full bg-brand/15 blur-3xl [animation-delay:-7s] motion-reduce:animate-none" />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[52%] overflow-hidden [perspective:700px]">
        <div className="absolute -inset-x-1/2 top-0 h-[220%] origin-top animate-grid bg-[linear-gradient(to_right,rgba(152,174,7,0.26)_1px,transparent_1px),linear-gradient(to_bottom,rgba(152,174,7,0.26)_1px,transparent_1px)] bg-[size:80px_80px] [transform:rotateX(64deg)] motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-night via-night/35 to-transparent" />
      </div>

      <div className="container-x relative grid gap-12 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16 lg:pb-28 lg:pt-24">
        <motion.div style={{ y: textY }} className="relative">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-400"
          >
            <span className="h-px w-10 bg-brand-400" />
            Casse auto à Colomiers, près de Toulouse
          </motion.p>

          <motion.h1
            variants={container}
            initial={reduce ? "show" : "hidden"}
            animate="show"
            className="display-title mt-6 text-[3.4rem] leading-[0.92] sm:text-7xl lg:text-[5.6rem]"
          >
            {LINES.map((line) => (
              <span key={line.words.join(" ")} className="block [perspective:800px]">
                {line.words.map((w) => (
                  <motion.span
                    key={w}
                    variants={word}
                    className={`inline-block origin-bottom will-change-transform ${
                      line.accent === "brand" ? "text-brand-400" : line.accent === "outline" ? "text-outline-brand" : ""
                    }`}
                  >
                    {w}&nbsp;
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
            className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg"
          >
            Trouvez simplement et rapidement votre pièce auto d&apos;occasion pas cher, testée et garantie
            12 mois. Expédition sous 24/48h partout en France, ou retrait sur place.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold"
          >
            {ARGUMENTS.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckIcon size={18} className="text-brand-400" />
                {t}
              </li>
            ))}
          </motion.ul>

          {/* Voiture sur la route */}
          <motion.div style={{ x: carX, opacity: carOpacity }} className="pointer-events-none mt-10 w-full max-w-[620px] lg:mt-14">
            <CarLineArt className="h-auto w-full animate-float motion-reduce:animate-none" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 48, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: EASE }}
          className="[perspective:1400px] lg:sticky lg:top-40"
        >
          <HeroSearch />
          <p className="mt-4 text-center text-xs text-white/50">
            Stock synchronisé en temps réel avec notre atelier de Colomiers.
          </p>
        </motion.div>
      </div>

      {/* Indice de défilement */}
      <div aria-hidden className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 lg:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Découvrir</span>
        <span className="h-8 w-px overflow-hidden bg-white/20">
          <span className="block h-4 w-px animate-cue bg-brand-400" />
        </span>
      </div>
    </section>
  );
}
