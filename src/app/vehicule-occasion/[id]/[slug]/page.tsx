import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getVehicle, searchParts, vehicleHref, vehicleLabel } from "@/lib/catalog";
import { formatDate, formatMileage, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DemoNotice } from "@/components/site/DemoNotice";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { PartsGrid } from "@/components/catalog/PartsGrid";
import { PhoneIcon } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/vehicule-occasion/[id]/[slug]">): Promise<Metadata> {
  const { id } = await params;
  const v = await getVehicle(Number(id));
  if (!v) return {};
  const label = vehicleLabel(v);
  return {
    title: v.forSale ? `${label} d'occasion à vendre` : `${label} : pièces d'occasion disponibles`,
    description: v.forSale
      ? `${label}, ${v.mileage ? formatMileage(v.mileage) : ""}, ${v.energy ?? ""} ${v.gearbox ?? ""}. Véhicule d'occasion à vendre à Colomiers près de Toulouse.`
      : `${v.partsCount} pièces d'occasion disponibles issues de ce ${label}, testées et garanties 12 mois.`,
    alternates: { canonical: vehicleHref(v) },
  };
}

export default async function VehiclePage({ params }: PageProps<"/vehicule-occasion/[id]/[slug]">) {
  const { id, slug } = await params;
  const v = await getVehicle(Number(id));
  if (!v) notFound();
  if (slug !== v.slug) permanentRedirect(vehicleHref(v));
  const parts = await searchParts({ vehicleId: v.id, perPage: 48 });
  const label = vehicleLabel(v);

  const specs = [
    { label: "Marque", value: v.brandName },
    { label: "Modèle", value: v.modelName },
    { label: "Version", value: v.version },
    { label: "Mise en circulation", value: v.firstRegistration ? formatDate(v.firstRegistration) : null },
    { label: "Kilométrage", value: v.mileage !== null ? formatMileage(v.mileage) : null },
    { label: "Énergie", value: v.energy },
    { label: "Boîte de vitesses", value: v.gearbox },
    { label: "Code moteur", value: v.engineCode },
    { label: "Code boîte", value: v.gearboxCode },
    { label: "Couleur", value: v.color },
    { label: "Type mine", value: v.typeMine },
    { label: "Identifiant véhicule", value: String(v.id) },
  ].filter((s) => s.value);

  return (
    <>
      <div className="container-x pt-6">
        <Breadcrumbs items={[{ label: "Véhicules d'occasion", href: "/vehicules-occasion" }, { label: label }]} />
        <DemoNotice className="mt-4" />
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-14 lg:py-12">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ProductGallery photos={v.photos} alt={label} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">{v.forSale ? "Véhicule à vendre" : "Véhicule pour pièces"}</p>
          <h1 className="display-title mt-3 text-4xl text-ink sm:text-5xl">
            {v.brandName} {v.modelName}
          </h1>
          {v.version && <p className="mt-2 text-lg text-steel">{v.version}</p>}

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5">
            {v.forSale && v.price !== null ? (
              <>
                <p className="display-title text-5xl text-ink">{formatPrice(v.price)}</p>
                <p className="mt-1 text-xs text-steel">Prix TTC, véhicule visible sur rendez-vous à Colomiers</p>
              </>
            ) : (
              <>
                <p className="display-title text-4xl text-ink">
                  {v.partsCount} pièce{v.partsCount > 1 ? "s" : ""} disponible{v.partsCount > 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-xs text-steel">Issues de ce véhicule, testées et garanties 12 mois</p>
              </>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?sujet=${encodeURIComponent(`Véhicule ${label} (n° ${v.id})`)}`}
                className="flex flex-1 items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400"
              >
                {v.forSale ? "Demander des informations" : "Demander une pièce de ce véhicule"}
              </Link>
              <a href={site.phoneHref} className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3.5 text-sm font-bold text-ink transition hover:border-brand">
                <PhoneIcon size={18} /> {site.phone}
              </a>
            </div>
          </div>

          <dl className="mt-8 divide-y divide-line rounded-2xl border border-line">
            {specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-2.5 text-sm">
                <dt className="text-steel">{s.label}</dt>
                <dd className="font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-x py-14">
          <h2 className="display-title text-3xl text-ink sm:text-4xl">Pièces disponibles issues de ce véhicule</h2>
          <div className="mt-8">
            <PartsGrid parts={parts.items} emptyTitle="Aucune pièce de ce véhicule n'est encore en ligne" />
          </div>
        </div>
      </section>
    </>
  );
}
