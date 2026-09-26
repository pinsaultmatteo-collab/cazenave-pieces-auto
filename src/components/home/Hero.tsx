"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { HeroSearch } from "./HeroSearch";
import { SportCar } from "@/components/svg/SportCar";
import { CheckIcon } from "@/components/icons";
import { EASE } from "@/components/motion/Reveal";
import { photos } from "@/lib/photos";

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
  const carOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, reduce ? 1 : 0]);
  // Le petit coupé traverse l'écran de gauche à droite pendant le défilement du hero.
  const coupeLeft = useTransform(scrollYProgress, [0, 0.7], ["0%", reduce ? "0%" : "100%"]);
  const coupeX = useTransform(scrollYProgress, [0, 0.7], ["0%", reduce ? "0%" : "-100%"]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);

  return (
    <section ref={ref} className="grain relative isolate overflow-hidden bg-night text-white">
      {/* Fond : photo aérienne du bâtiment, voile sombre continu, halos lumineux */}
      <motion.div aria-hidden style={{ y: photoY }} className="absolute inset-0 -z-30 scale-110">
        <Image
          src={photos.heroBuilding}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[center_40%]"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,rgba(13,22,27,0.86)_0%,rgba(13,22,27,0.74)_55%,rgba(13,22,27,0.92)_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_left,rgba(152,174,7,0.2),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] animate-blob rounded-full bg-brand/15 blur-3xl motion-reduce:animate-none" />
        <div className="absolute right-[-10rem] bottom-0 h-[26rem] w-[26rem] animate-blob rounded-full bg-brand/10 blur-3xl [animation-delay:-7s] motion-reduce:animate-none" />
      </div>

      <div className="container-x relative grid gap-6 pt-8 sm:gap-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-16 lg:gap-y-0 lg:pt-24">
        <motion.div style={{ y: textY }} className="relative text-center lg:col-start-1 lg:row-start-1 lg:text-left">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400 sm:text-xs sm:tracking-[0.3em] lg:justify-start"
          >
            <span className="hidden h-px w-10 bg-brand-400 lg:block" />
            Casse auto à Colomiers, près de Toulouse
          </motion.p>

          <motion.h1
            variants={container}
            initial={reduce ? "show" : "hidden"}
            animate="show"
            className="display-title mt-4 text-[2.25rem] leading-[0.92] sm:mt-5 sm:text-7xl lg:mt-6 lg:text-[4.6rem] xl:text-[5.6rem]"
          >
            {LINES.map((line) => (
              <span key={line.words.join(" ")} className={`[perspective:800px] ${line.accent ? "inline lg:block" : "block"}`}>
                {line.words.map((w, i) => (
                  <motion.span
                    key={w}
                    variants={word}
                    className={`inline-block origin-bottom will-change-transform ${
                      line.accent === "brand" ? "text-brand-400" : line.accent === "outline" ? "text-outline-brand" : ""
                    }`}
                  >
                    {w}
                    {i < line.words.length - 1 ? "\u00a0" : ""}
                  </motion.span>
                ))}
                {/* Sur mobile, « d'occasion » et « depuis 1974 » se suivent sur la même ligne */}
                {line.accent ? " " : null}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
            className="mx-auto mt-4 max-w-xl text-justify text-[15px] leading-6 text-white/75 [text-align-last:center] sm:mt-6 sm:text-lg sm:leading-7 lg:mx-0 lg:mt-7 lg:text-left lg:[text-align-last:auto]"
          >
            Trouvez simplement et rapidement votre pièce auto d&apos;occasion pas cher, testée et garantie
            12 mois. Expédition sous 24/48h partout en France, ou retrait sur place.
          </motion.p>

        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 48, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.6, duration: 1, ease: EASE }}
          className="[perspective:1400px] lg:sticky lg:top-44 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <HeroSearch />
          <p className="mt-4 text-center text-xs text-white/50">
            Stock synchronisé en temps réel avec notre atelier de Colomiers.
          </p>
        </motion.div>

        <motion.ul
          style={{ y: textY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold lg:col-start-1 lg:row-start-2 lg:mt-7 lg:justify-start"
        >
          {ARGUMENTS.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckIcon size={18} className="text-brand-400" />
              {t}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Petit coupé qui roule sur sa ligne de route, sous le titre */}
      <div aria-hidden className="pointer-events-none relative mt-10 h-24 w-full sm:h-28 lg:mt-6 lg:h-32">
        <div className="absolute inset-x-0 bottom-3 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <motion.div style={{ left: coupeLeft, x: coupeX, opacity: carOpacity }} className="absolute bottom-0 w-[min(58vw,220px)] will-change-transform sm:w-[min(40vw,260px)] lg:w-[300px]">
          <SportCar className="h-auto w-full animate-float motion-reduce:animate-none [animation-duration:5s]" />
        </motion.div>
      </div>

      {/* Indice de défilement */}
      <div aria-hidden className="absolute bottom-5 right-8 hidden flex-col items-center gap-2 text-white/50 lg:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Découvrir</span>
        <span className="h-8 w-px overflow-hidden bg-white/20">
          <span className="block h-4 w-px animate-cue bg-brand-400" />
        </span>
      </div>
    </section>
  );
}
