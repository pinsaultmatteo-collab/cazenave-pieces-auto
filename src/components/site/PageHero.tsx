import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

type PageHeroProps = {
  kicker?: string;
  title: ReactNode;
  text?: ReactNode;
  image?: StaticImageData | string;
  imageAlt?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
  /** Hauteur réduite pour les pages utilitaires. */
  compact?: boolean;
};

/** En-tête de page sombre, avec photo en fond optionnelle. */
export function PageHero({ kicker, title, text, image, imageAlt = "", crumbs, children, compact = false }: PageHeroProps) {
  return (
    <section className="grain relative isolate overflow-hidden bg-night text-white">
      {image && (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          placeholder={typeof image === "string" ? undefined : "blur"}
          className="-z-20 object-cover object-center"
        />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(13,22,27,0.86),rgba(13,22,27,0.8)_60%,#0d161b)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(152,174,7,0.2),transparent_55%)]" />
      <div className={`container-x ${compact ? "py-10 lg:py-14" : "py-14 lg:py-24"}`}>
        {crumbs && <Breadcrumbs items={crumbs} dark />}
        {kicker && (
          <p className="mt-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
            <span className="h-px w-10 bg-brand-400" />
            {kicker}
          </p>
        )}
        <h1 className={`display-title mt-4 max-w-4xl ${compact ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl lg:text-7xl"}`}>{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{text}</p>}
        {children}
      </div>
    </section>
  );
}
