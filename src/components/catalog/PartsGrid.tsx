import Link from "next/link";
import type { Part } from "@/lib/catalog";
import { PartCard } from "./PartCard";
import { site } from "@/lib/site";

export function PartsGrid({ parts, emptyTitle = "Aucune pièce ne correspond à votre recherche" }: { parts: Part[]; emptyTitle?: string }) {
  if (parts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
        <p className="font-display text-2xl font-semibold uppercase text-ink">{emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-steel">
          Notre stock évolue toutes les 30 minutes. Envoyez-nous votre immatriculation et la pièce recherchée par SMS,
          nous vérifions en rayon pour vous.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a href={site.smsHref} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-brand-400">
            SMS au {site.sms}
          </a>
          <Link href="/contact" className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brand">
            Nous écrire
          </Link>
        </div>
      </div>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {parts.map((p, i) => (
        <li key={p.id}>
          <PartCard part={p} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
