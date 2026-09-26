import Image from "next/image";
import Link from "next/link";
import logos from "@/content/brand-logos.json";

export type MarqueeBrand = { slug: string; name: string; count: number };

const LOGOS = logos as Record<string, string>;

/**
 * Bandeau défilant des marques en stock, logo et nom côte à côte.
 * Défilement continu en CSS, mis en pause au survol ; chaque marque mène
 * à sa page. Le bandeau est doublé pour boucler sans à-coup.
 */
export function BrandsMarquee({ brands }: { brands: MarqueeBrand[] }) {
  const row = [...brands, ...brands];
  return (
    <section aria-label="Marques en stock" className="group/marquee relative border-b border-white/10 bg-night py-4 text-white">
      <p className="sr-only">{brands.length} marques disponibles en pièces d&apos;occasion</p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee items-center [animation-duration:70s] group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((b, i) => (
            <li key={`${b.slug}-${i}`} aria-hidden={i >= brands.length} className="shrink-0">
              <Link
                href={`/pieces-auto/marques/${b.slug}`}
                tabIndex={i >= brands.length ? -1 : 0}
                title={`${b.count.toLocaleString("fr-FR")} pièces ${b.name}`}
                className="group/brand mx-5 flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition duration-300 hover:bg-white/[0.07]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-md shadow-black/30 transition-transform duration-300 group-hover/brand:scale-110">
                  {LOGOS[b.slug] ? (
                    <Image src={LOGOS[b.slug]} alt="" width={40} height={40} loading="eager" className="h-8 w-8 object-contain" />
                  ) : (
                    <span className="font-display text-lg font-semibold text-ink">{b.name.charAt(0)}</span>
                  )}
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-2xl font-semibold uppercase tracking-wide">{b.name}</span>
                  <span className="mt-1 text-[11px] font-semibold text-brand-400">{b.count.toLocaleString("fr-FR")} pièces</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
