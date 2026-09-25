"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { Era } from "@/lib/history";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

/** Frise chronologique : le fil se trace au scroll, chaque étape apparaît en alternance. */
export function Timeline({ eras }: { eras: Era[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 70%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const scaleY = useTransform(progress, [0, 1], [reduce ? 1 : 0, 1]);

  return (
    <ol ref={ref} className="relative mx-auto max-w-5xl space-y-16 lg:space-y-24">
      {/* Fil */}
      <div aria-hidden className="absolute bottom-0 left-4 top-0 w-px bg-ink-100 lg:left-1/2" />
      <motion.div aria-hidden style={{ scaleY }} className="absolute bottom-0 left-4 top-0 w-px origin-top bg-brand lg:left-1/2" />

      {eras.map((era, i) => {
        const right = i % 2 === 1;
        return (
          <li key={era.year} className="relative pl-12 lg:grid lg:grid-cols-2 lg:gap-16 lg:pl-0">
            {/* Point sur le fil */}
            <span aria-hidden className="absolute left-4 top-3 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-brand bg-white lg:left-1/2">
              <span className="h-2 w-2 rounded-full bg-brand" />
            </span>

            <Reveal className={`${right ? "lg:order-2 lg:pl-8" : "lg:order-1 lg:pr-8 lg:text-right"}`}>
              <p className="display-title text-6xl text-brand-700 sm:text-7xl">{era.year}</p>
              <h3 className="font-display mt-2 text-3xl font-semibold uppercase leading-none text-ink">{era.title}</h3>
              <p className="mt-4 leading-7 text-steel">{era.text}</p>
            </Reveal>

            <Reveal delay={0.15} className={`mt-6 lg:mt-0 ${right ? "lg:order-1 lg:pr-8" : "lg:order-2 lg:pl-8"} [perspective:1000px]`}>
              <TiltCard className="relative rounded-2xl" max={6}>
                <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-mist shadow-xl shadow-ink/10">
                  <Image
                    src={era.photo}
                    alt={era.alt}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    placeholder={era.photo.src.endsWith(".png") ? undefined : "blur"}
                    className="max-h-[420px] w-full object-contain"
                  />
                </div>
              </TiltCard>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
