import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { isPaymentConfigured } from "@/lib/payment";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }: PageProps<"/commande">) {
  const sp = await searchParams;
  const cancelled = Array.isArray(sp.annule) ? sp.annule[0] : sp.annule;
  return (
    <>
      <PageHero kicker="Commande" title="Finaliser ma commande" crumbs={[{ label: "Panier", href: "/panier" }, { label: "Commande" }]} compact />
      <div className="container-x py-10 lg:py-14">
        {isPaymentConfigured() ? (
          <CheckoutForm cancelled={cancelled} />
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-3xl font-semibold uppercase text-ink">Paiement en ligne bientôt disponible</p>
            <p className="mt-3 text-sm leading-6 text-steel">
              Réservez vos pièces par téléphone au <a href={site.phoneHref} className="font-bold text-ink">{site.phone}</a> ou par SMS au{" "}
              <a href={site.smsHref} className="font-bold text-ink">{site.sms}</a>, en indiquant les numéros de pièces de votre panier.
            </p>
            <Link href="/panier" className="mt-6 inline-flex rounded-full border border-line px-6 py-3 text-sm font-bold text-ink hover:border-brand">
              Retour au panier
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
