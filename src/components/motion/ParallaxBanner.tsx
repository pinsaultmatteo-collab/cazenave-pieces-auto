"use client";

import { useRef, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type ParallaxBannerProps = {
  image: StaticImageData;
  alt: string;
  children?: ReactNode;
  className?: string;
  /** Amplitude du déplacement de l'image, en pixels. */
  amount?: number;
  /** Assombrissement de la photo (classes Tailwind). */
  overlayClassName?: string;
};

/** Bandeau photo pleine largeur dont l'image glisse plus lentement que la page. */
export function ParallaxBanner({
  image,
  alt,
  children,
  className = "",
  amount = 120,
  overlayClassName = "bg-night/60",
}: ParallaxBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -amount, reduce ? 0 : amount]);

  return (
    <div ref={ref} className={`relative isolate overflow-hidden ${className}`}>
      <motion.div aria-hidden style={{ y }} className="absolute inset-[-15%] -z-10">
        <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" placeholder="blur" />
      </motion.div>
      <div aria-hidden className={`absolute inset-0 -z-10 ${overlayClassName}`} />
      {children}
    </div>
  );
}
