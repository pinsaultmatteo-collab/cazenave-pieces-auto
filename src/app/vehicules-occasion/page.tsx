import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { DemoNotice } from "@/components/site/DemoNotice";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { Pagination } from "@/components/catalog/Pagination";
import { getVehicles } from "@/lib/catalog";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Véhicules d'occasion et véhicules pour pièces",
  description:
    "Véhicules d'occasion à vendre et véhicules sur parc dont les pièces sont disponibles, à Colomiers près de Toulouse. Chaque véhicule est identifié, contrôlé et documenté.",
  alternates: { canonical: "/vehicules-occasion" },
};

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicules-occasion">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const result = await getVehicles({ page });

  return (
    <>
      <PageHero
        kicker="Le parc"
        title={
          <>
            Véhicules <span className="text-brand-400">d&apos;occasion</span>
          </>
        }
        text="Certains véhicules réceptionnés sont revendus entiers, les autres sont démontés pièce par pièce. Chaque fiche indique l'origine, le kilométrage et les pièces encore disponibles."
        image={photos.heroDrone}
        imageAlt="Vue aérienne du parc de véhicules"
        crumbs={[{ label: "Véhicules d'occasion" }]}
        compact
      />
      <div className="container-x py-10 lg:py-14">
        <DemoNotice className="mb-6" />
        <p className="text-sm font-semibold text-ink">
          {result.total} véhicule{result.total > 1 ? "s" : ""} sur le parc
        </p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((v) => (
            <li key={v.id}>
              <VehicleCard vehicle={v} />
            </li>
          ))}
        </ul>
        <Pagination page={result.page} pages={result.pages} basePath="/vehicules-occasion" />
      </div>
    </>
  );
}
