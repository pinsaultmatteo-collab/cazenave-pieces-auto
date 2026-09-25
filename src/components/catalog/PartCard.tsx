import Image from "next/image";
import Link from "next/link";
import { partHref, type Part } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { CheckIcon, TruckIcon } from "@/components/icons";

const CONDITION_LABEL: Record<Part["condition"], string> = {
  GOOD: "Bon état",
  CORRECT: "État correct",
  BAD: "État moyen",
};

export function PartCard({ part, priority = false }: { part: Part; priority?: boolean }) {
  const vehicle = [part.brandName, part.modelName].filter(Boolean).join(" ");
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <Link href={partHref(part)} className="relative block aspect-[4/3] overflow-hidden bg-mist">
        {part.vignette ? (
          <Image
            src={part.vignette}
            alt={`${part.name} ${vehicle}`.trim()}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-steel">Photo à venir</span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-night/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {part.partType === "NEW" ? "Neuf" : "Occasion"}
        </span>
        {part.shippingAvailable ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink" title="Livraison possible">
            <TruckIcon size={16} />
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{part.categoryName}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold uppercase leading-none text-ink">
          <Link href={partHref(part)} className="hover:text-brand-700">
            {part.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm text-steel">
          {vehicle}
          {part.version ? ` · ${part.version}` : ""}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-steel">
          {part.manufacturerReference && (
            <div>
              <dt className="sr-only">Référence</dt>
              <dd>Réf. {part.manufacturerReference}</dd>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CheckIcon size={14} className="text-brand" />
            <dd>{CONDITION_LABEL[part.condition]}</dd>
          </div>
          <div>
            <dd>Garantie {part.warrantyMonths} mois</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="display-title text-3xl text-ink">{formatPrice(part.priceTtc)}</p>
            <p className="text-[11px] text-steel">TTC · {formatPrice(part.priceHt)} HT</p>
          </div>
          <Link
            href={partHref(part)}
            className="rounded-full bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400"
          >
            Voir
          </Link>
        </div>
      </div>
    </article>
  );
}
