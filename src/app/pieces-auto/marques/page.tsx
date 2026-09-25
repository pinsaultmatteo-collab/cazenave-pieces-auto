import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { DemoNotice } from "@/components/site/DemoNotice";
import { getBrandCounts, getBrands } from "@/lib/catalog";
import { photos } from "@/lib/photos";
import { ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Pièces auto d'occasion par marque",
  description:
    "Retrouvez nos pièces d'occasion par constructeur : Peugeot, Renault, Citroën, Volkswagen, Toyota, Ford, Dacia et bien d'autres. Stock réel, garantie 12 mois.",
  alternates: { canonical: "/pieces-auto/marques" },
};

export default async function BrandsPage() {
  const [brands, counts] = await Promise.all([getBrands(), getBrandCounts()]);
  const groups = new Map<string, typeof brands>();
  for (const b of brands) {
    const letter = b.name.charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), b]);
  }

  return (
    <>
      <PageHero
        kicker="Le catalogue"
        title={
          <>
            Toutes les <span className="text-brand-400">marques</span>
          </>
        }
        text="Nos pièces sont issues de véhicules de toutes marques. Choisissez la vôtre pour afficher les modèles et les pièces disponibles."
        image={photos.parcRows}
        imageAlt="Rangées de véhicules sur le parc"
        crumbs={[{ label: "Pièces auto", href: "/pieces-auto" }, { label: "Marques" }]}
        compact
      />
      <div className="container-x py-10 lg:py-14">
        <DemoNotice className="mb-8" />
        <div className="space-y-10">
          {[...groups.entries()].map(([letter, list]) => (
            <section key={letter} className="grid gap-4 lg:grid-cols-[4rem_1fr]">
              <h2 className="display-title text-4xl text-brand-700">{letter}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/pieces-auto/marques/${b.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition hover:border-brand hover:shadow-md"
                    >
                      <span>
                        <span className="block font-display text-2xl font-semibold uppercase leading-none text-ink">{b.name}</span>
                        <span className="mt-1 block text-xs text-steel">
                          {counts[b.id] ?? 0} pièce{(counts[b.id] ?? 0) > 1 ? "s" : ""} en stock
                        </span>
                      </span>
                      <ChevronRightIcon className="text-steel transition group-hover:translate-x-1 group-hover:text-brand-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
