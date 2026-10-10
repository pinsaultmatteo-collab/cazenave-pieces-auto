"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type Fit = "contain" | "cover";

/** Nom des photos Scancube dans Opisto : « …-photo0_l.jpeg ». */
const SCANCUBE_NAME = /-photo\d+_[a-z]+\.jpe?g$/i;

/** Suffixe de taille des photos Opisto : _s (≈ 266 px), _m (≈ 666 px), _l (≈ 1365 px). */
const OPISTO_SIZE = /_(s|m|l)\.(jpe?g|png)$/i;

/** Même photo Opisto dans une autre taille (adresse inchangée si elle ne suit pas ce format). */
export function opistoPhoto(src: string, size: "small" | "medium"): string {
  return src.replace(OPISTO_SIZE, (_m, _s, ext: string) => `_${size === "small" ? "s" : "m"}.${ext}`);
}

type PartPhotoProps = ImageProps & {
  /**
   * Taille Opisto servie telle quelle, sans recompression par Vercel (facturée à la
   * transformation) : « small » pour les miniatures, « medium » pour les cartes.
   * Sans valeur, l'image est optimisée par Vercel (photo principale de la fiche).
   */
  opistoSize?: "small" | "medium";
};

/**
 * Photo de pièce qui s'adapte à sa source :
 * - photo Scancube (carrée, fond blanc) : affichée entière sur fond blanc, sans rien couper ;
 * - photo prise au téléphone (paysage ou portrait) : remplit le cadre, quitte à rogner les bords.
 * Le format est deviné d'après le nom du fichier, puis confirmé par les dimensions réelles au chargement.
 */
export function PartPhoto({ className = "", onLoad, opistoSize, src, ...props }: PartPhotoProps) {
  const [fit, setFit] = useState<Fit>(() => (typeof src === "string" && SCANCUBE_NAME.test(src) ? "contain" : "cover"));
  const direct = Boolean(opistoSize) && typeof src === "string" && /^https?:\/\//.test(src);
  return (
    <Image
      {...props}
      src={direct ? opistoPhoto(src as string, opistoSize!) : src}
      unoptimized={direct || props.unoptimized}
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
