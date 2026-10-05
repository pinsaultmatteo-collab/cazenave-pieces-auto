"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type Fit = "contain" | "cover";

/** Nom des photos Scancube dans Opisto : « …-photo0_l.jpeg ». */
const SCANCUBE_NAME = /-photo\d+_[a-z]+\.jpe?g$/i;

/**
 * Photo de pièce qui s'adapte à sa source :
 * - photo Scancube (carrée, fond blanc) : affichée entière sur fond blanc, sans rien couper ;
 * - photo prise au téléphone (paysage ou portrait) : remplit le cadre, quitte à rogner les bords.
 * Le format est deviné d'après le nom du fichier, puis confirmé par les dimensions réelles au chargement.
 */
export function PartPhoto({ className = "", onLoad, ...props }: ImageProps) {
  const [fit, setFit] = useState<Fit>(() => (typeof props.src === "string" && SCANCUBE_NAME.test(props.src) ? "contain" : "cover"));
  return (
    <Image
      {...props}
      alt={props.alt}
      className={`bg-white ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      onLoad={(e) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
        if (w && h) setFit(Math.abs(w / h - 1) < 0.06 ? "contain" : "cover");
        onLoad?.(e);
      }}
    />
  );
}
