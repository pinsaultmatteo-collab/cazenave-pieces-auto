import { site } from "@/lib/site";
import { SAMPLE_REVIEWS, type Review } from "@/lib/reviews";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ArrowUpRightIcon, QuoteIcon, StarIcon } from "@/components/icons";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} size={16} className={i < rating ? "text-brand" : "text-ink-100"} />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <QuoteIcon size={28} className="absolute right-5 top-5 text-brand-100" />
      <Stars rating={review.rating} />
      <p className="mt-4 flex-1 text-sm leading-6 text-ink">{review.text}</p>
      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs">
        <span className="font-bold text-ink">{review.author}</span>
        <span className="text-steel">
          {review.date} · {review.source}
        </span>
      </footer>
    </article>
  );
}

/** Bloc avis clients : mise en avant Google et cartes d'avis. */
export function Reviews({ reviews = SAMPLE_REVIEWS }: { reviews?: Review[] }) {
  return (
    <section className="bg-mist">
      <div className="container-x py-20 lg:py-28">
        <Reveal className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Avis clients</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Ils nous font confiance</h2>
            <p className="mt-3 max-w-xl text-steel">
              Particuliers, garages, assureurs : depuis 1974, la même exigence au comptoir et en ligne.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {reviews.map((r, i) => (
            <StaggerItem key={i}>
              <ReviewCard review={r} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
