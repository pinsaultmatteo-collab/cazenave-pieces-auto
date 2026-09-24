"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE } from "./Reveal";

type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

/**
 * Nombre qui « monte » jusqu'à sa valeur quand il entre à l'écran.
 * La valeur finale est rendue côté serveur (référencement), l'animation
 * ne se joue que dans le navigateur.
 */
export function Counter({ to, prefix = "", suffix = "", decimals = 0, duration = 1.8, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);

  // Dès que le chiffre entre à l'écran, il part de zéro et monte jusqu'à sa
  // valeur (sauf si l'utilisateur préfère réduire les animations).
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  const formatted = value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
