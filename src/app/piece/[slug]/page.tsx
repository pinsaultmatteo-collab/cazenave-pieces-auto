import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getPart, getRelatedParts, getVehicle, partHref, vehicleHref, vehicleLabel, type Part } from "@/lib/catalog";
import { idFromSlug } from "@/lib/slug";
import { formatDate, formatMileage, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { DemoNotice } from "@/components/site/DemoNotice";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { PartCard } from "@/components/catalog/PartCard";
import { CheckIcon, ChevronRightIcon, PhoneIcon, ShieldIcon, TruckIcon } from "@/components/icons";

const CONDITION: Record<Part["condition"], string> = { GOOD: "Bon état", CORRECT: "État correct", BAD: "État moyen" };

async function load(slug: string) {
  const id = idFromSlug(slug);
  if (!id) return null;
  return getPart(id);
}

export async function generateMetadata({ params }: PageProps<"/piece/[slug]">): Promise<Metadata> {
  const part = await load((await params).slug);
  if (!part) return {};
  const vehicle = [part.brandName, part.modelName].filter(Boolean).join(" ");
  return {
    title: `${part.name} ${vehicle} d'occasion`,
    description: `${part.name} d'occasion pour ${vehicle}${part.version ? ` ${part.version}` : ""}, ${CONDITION[part.condition].toLowerCase()}, garantie ${part.warrantyMonths} mois. ${formatPrice(part.priceTtc)} TTC.${part.manufacturerReference ? ` Référence ${part.manufacturerReference}.` : ""}`,
    alternates: { canonical: partHref(part) },
    openGraph: part.vignette ? { images: [{ url: part.vignette }] } : undefined,
  };
}

export default async function PartPage({ params }: PageProps<"/piece/[slug]">) {
  const { slug } = await params;
  const part = await load(slug);
  if (!part) notFound();
  if (slug !== `${part.id}-${part.slug}`) permanentRedirect(partHref(part));

  const [related, vehicle] = await Promise.all([getRelatedParts(part), part.vehicleId ? getVehicle(part.vehicleId) : null]);
  const vehicleName = [part.brandName, part.modelName].filter(Boolean).join(" ");
  const canBuy = part.available && part.inStock;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${part.name} ${vehicleName}`.trim(),
    description: part.description ?? undefined,
    image: part.photos,
    sku: String(part.id),
    mpn: part.manufacturerReference ?? undefined,
    brand: part.brandName ? { "@type": "Brand", name: part.brandName } : undefined,
    itemCondition: part.partType === "NEW" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url: `${site.url}${partHref(part)}`,
      priceCurrency: "EUR",
      price: part.priceTtc.toFixed(2),
      availability: canBuy ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: part.partType === "NEW" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: site.name },
    },
  };

  const specs: { label: string; value: string | null }[] = [
    { label: "Référence constructeur", value: part.manufacturerReference },
    { label: "Référence équipementier", value: part.adaptableReference },
    { label: "Véhicule d'origine", value: vehicle ? vehicleLabel(vehicle) : vehicleName || null },
    { label: "Mise en circulation", value: part.firstRegistration ? formatDate(part.firstRegistration) : null },
    { label: "Kilométrage du véhicule", value: part.mileage !== null ? formatMileage(part.mileage) : null },
    { label: "Couleur", value: part.color },
    ...part.characteristics.map((c) => ({ label: c.key, value: c.value })),
    { label: "Identifiant pièce", value: String(part.id) },
  ];

  return (
    <>
      <div className="container-x pt-6">
        <Breadcrumbs
          items={[
            { label: "Pièces auto", href: "/pieces-auto" },
            { label: part.categoryName, href: `/pieces-auto/${part.categoryName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` },
            { label: part.name },
          ]}
        />
        <DemoNotice className="mt-4" />
      </div>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-14 lg:py-12">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <ProductGallery photos={part.photos} alt={`${part.name} ${vehicleName}`} />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">{part.categoryName}</p>
          <h1 className="display-title mt-3 text-4xl text-ink sm:text-5xl">{part.name}</h1>
          <p className="mt-3 text-lg font-semibold text-ink">
            {vehicleName}
            {part.version ? <span className="font-normal text-steel"> · {part.version}</span> : null}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <li className="rounded-full bg-mist px-3 py-1.5 text-ink">{part.partType === "NEW" ? "Pièce neuve" : "Pièce d'occasion"}</li>
            <li className="flex items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-ink">
              <CheckIcon size={14} className="text-brand" /> {CONDITION[part.condition]}
            </li>
            <li className="flex items-center gap-1 rounded-full bg-mist px-3 py-1.5 text-ink">
              <ShieldIcon size={14} className="text-brand" /> Garantie {part.warrantyMonths} mois
            </li>
          </ul>

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="display-title text-5xl text-ink">{formatPrice(part.priceTtc)}</p>
                <p className="mt-1 text-xs text-steel">
                  TTC · {formatPrice(part.priceHt)} HT · TVA {Math.round(part.vatRate * 100)} %
                </p>
              </div>
              <p className={`flex items-center gap-1.5 text-sm font-bold ${canBuy ? "text-brand-700" : "text-steel"}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${canBuy ? "bg-brand" : "bg-steel"}`} />
                {canBuy ? "En stock à Colomiers" : "Indisponible"}
              </p>
            </div>

            <div className="mt-6">
              <AddToCartButton partId={part.id} available={canBuy} />
            </div>

            <ul className="mt-6 space-y-2.5 text-sm text-ink">
              <li className="flex items-start gap-2.5">
                <TruckIcon size={18} className="mt-0.5 shrink-0 text-brand-700" />
                {part.shippingAvailable ? (
                  <span>
                    Expédition sous 24/48h partout en France
                    {part.shippingCost !== null ? <span className="text-steel"> · à partir de {formatPrice(part.shippingCost)}</span> : null}
                  </span>
                ) : (
                  <span>
                    Retrait sur place uniquement (pièce volumineuse). <span className="text-steel">Devis transport sur demande.</span>
                  </span>
                )}
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand-700" />
                Retrait gratuit au comptoir de Colomiers, du lundi au vendredi de 9h à 17h
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon size={18} className="mt-0.5 shrink-0 text-brand-700" />
                <span>
                  Un doute sur la compatibilité ? SMS au{" "}
                  <a href={site.smsHref} className="font-bold underline">
                    {site.sms}
                  </a>{" "}
                  avec votre immatriculation.
                </span>
              </li>
            </ul>
          </div>

          {part.description && (
            <div className="mt-8">
              <h2 className="font-display text-2xl font-semibold uppercase text-ink">Description</h2>
              <p className="mt-3 leading-7 text-steel">{part.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-2xl font-semibold uppercase text-ink">Caractéristiques</h2>
            <dl className="mt-3 divide-y divide-line rounded-2xl border border-line">
              {specs
                .filter((s) => s.value)
                .map((s) => (
                  <div key={s.label} className="grid grid-cols-[1fr_1.4fr] gap-4 px-4 py-2.5 text-sm">
                    <dt className="text-steel">{s.label}</dt>
                    <dd className="font-semibold text-ink">{s.value}</dd>
                  </div>
                ))}
            </dl>
            {vehicle && (
              <Link href={vehicleHref(vehicle)} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
                Voir le véhicule d&apos;origine et ses {vehicle.partsCount} pièces <ChevronRightIcon size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-mist">
          <div className="container-x py-14">
            <h2 className="display-title text-3xl text-ink sm:text-4xl">Vous pourriez aussi avoir besoin de</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <PartCard part={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
