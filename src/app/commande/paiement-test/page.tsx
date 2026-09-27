import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { TestPayButton } from "@/components/checkout/TestPayButton";
import { getOrderByRef, orderSummary } from "@/lib/orders/checkout";
import { verifyOrderToken } from "@/lib/orders/refs";
import { fakePaymentsAllowed } from "@/lib/payment/fake";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Paiement simulé", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Page de paiement simulé (jamais servie en production). */
export default async function TestPaymentPage({ searchParams }: PageProps<"/commande/paiement-test">) {
  if (!fakePaymentsAllowed()) notFound();
  const sp = await searchParams;
  const orderRef = typeof sp.ref === "string" ? sp.ref : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  if (!orderRef || !verifyOrderToken(orderRef, token)) notFound();
  const order = await getOrderByRef(orderRef);
  if (!order) notFound();
  const summary = orderSummary(order);

  return (
    <>
      <PageHero kicker="Environnement de test" title="Paiement simulé" crumbs={[{ label: "Commande", href: "/commande" }, { label: "Paiement" }]} compact />
      <div className="container-x max-w-xl py-10 lg:py-14">
        <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-800">Aucune carte, aucun débit</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Cette page remplace Stripe tant que les clés ne sont pas configurées. Le bouton ci-dessous marque la commande comme payée et
            déclenche exactement le même traitement qu&apos;un vrai paiement : enregistrement chez Opisto, e-mails de confirmation.
          </p>
          <dl className="mt-5 space-y-1 text-sm text-ink">
            <div className="flex justify-between">
              <dt>Commande</dt>
              <dd className="font-bold">{summary.ref}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Pièces</dt>
              <dd>{summary.count}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Montant TTC</dt>
              <dd className="font-bold">{formatPrice(summary.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Statut actuel</dt>
              <dd>{summary.status}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <TestPayButton orderRef={summary.ref} token={token} />
          </div>
        </div>
      </div>
    </>
  );
}
