"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Barre de progression de lecture, fixée en haut de l'écran, qui se remplit au défilement. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-white/10">
      <motion.div
        style={{ scaleX: reduce ? 1 : scaleX }}
        className="h-full w-full origin-left bg-gradient-to-r from-brand-700 via-brand-400 to-brand-400 shadow-[0_0_12px_rgba(184,207,31,0.6)]"
      />
    </div>
  );
}
