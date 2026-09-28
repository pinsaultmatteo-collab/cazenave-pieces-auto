import { site } from "@/lib/site";
import { SAMPLE_REVIEWS, type Review } from "@/lib/reviews";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowUpRightIcon, StarIcon } from "@/components/icons";
import { ReviewsCarousel } from "./ReviewsCarousel";

/** Bloc avis clients : mise en avant Google et carrousel d'avis. */
export function Reviews({ reviews = SAMPLE_REVIEWS }: { reviews?: Review[] }) {
  return (
    <section className="relative overflow-clip bg-mist">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="container-x relative py-20 lg:py-28">
        <Reveal className="grid gap-8 text-center lg:grid-cols-[1fr_auto] lg:items-end lg:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Avis clients</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Ils nous font confiance</h2>
            <p className="mx-auto mt-3 max-w-xl text-steel lg:mx-0">
              Particuliers, garages, assureurs : depuis 1974, la même exigence au comptoir et en ligne.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href={site.social.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-ink shadow-sm transition hover:border-brand hover:shadow-md"
            >
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} size={14} className="text-brand" />
                ))}
              </span>
              Voir nos avis Google
              <ArrowUpRightIcon size={16} className="text-steel" />
            </a>
            <a
              href={site.social.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-ink-700"
            >
              Donner mon avis
            </a>
          </div>
        </Reveal>

        <ReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}
