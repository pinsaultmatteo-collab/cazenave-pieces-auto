import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { ClearCart } from "@/components/checkout/ClearCart";
import { getOrderByRef, orderNumber, orderSummary } from "@/lib/orders/checkout";
import { discountTotal } from "@/lib/orders/fulfill";
import { verifyOrderToken } from "@/lib/orders/refs";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { CheckIcon, ClockIcon, PhoneIcon, PinIcon, TruckIcon } from "@/components/icons";
import type { OrderRow } from "@/db/schema";

export const metadata: Metadata = { title: "Confirmation de commande", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function loadOrder(orderRef: string, sessionId: string | null, token: string | null): Promise<OrderRow | null> {
  // Retour de Stripe : la session fait foi et permet de finaliser sans attendre le webhook.
  if (sessionId && process.env.STRIPE_SECRET_KEY && !sessionId.includes("{")) {
    const { confirmFromSession } = await import("@/lib/payment/stripe");
    const order = await confirmFromSession(sessionId).catch(() => null);
    if (order && orderSummary(order).ref === orderRef) return order;
  }
  if (token && verifyOrderToken(orderRef, token)) return getOrderByRef(orderRef);
  // Session de test ou session Stripe déjà enregistrée sur la commande
  const order = await getOrderByRef(orderRef);
  if (order && sessionId && order.paymentSessionId === sessionId) return order;
  return null;
}

export default async function ConfirmationPage({ searchParams }: PageProps<"/commande/confirmation">) {
  const sp = await searchParams;
  const orderRef = typeof sp.ref === "string" ? sp.ref : "";
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;
  const token = typeof sp.t === "string" ? sp.t : null;
  if (!orderRef) notFound();
  const order = await loadOrder(orderRef, sessionId, token);
  if (!order) notFound();
  const number = orderNumber(order);

  const paid = order.status === "paid" || order.status === "completed" || order.status === "opisto_failed";
  const ship = order.deliveryMode === "shipping";
  const addr = order.delivery ?? order.billing;

  return (
    <>
      <PageHero
        kicker={paid ? "Merci !" : "Commande en attente"}
        title={paid ? "Votre commande est confirmée" : "Paiement non finalisé"}
        crumbs={[{ label: "Commande" }]}
        compact
      />
      {paid && <ClearCart />}
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-14">
        <div className="space-y-6">
          <div className={`rounded-3xl border p-6 ${paid ? "border-brand-200 bg-brand-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">Numéro de commande</p>
            <p className="display-title mt-1 text-4xl text-ink">{number}</p>
            {paid ? (
              <p className="mt-3 text-sm leading-6 text-ink">
                Paiement reçu. Un e-mail de confirmation est envoyé à <strong>{order.email}</strong>.
                {ship
                  ? " Nous préparons vos pièces : expédition sous 24 à 48 h ouvrées, numéro de suivi par e-mail."
                  : " Vos pièces sont mises de côté au comptoir : présentez ce numéro lors du retrait."}
                {" "}Conservez ce numéro : il permet de suivre la commande et figure sur votre facture.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink">
                Le paiement n&apos;a pas été confirmé. Si vous venez de payer, patientez quelques secondes puis rechargez cette page. Sinon,{" "}
                <Link href="/commande" className="font-semibold text-brand-700 underline">
                  reprenez votre commande
                </Link>
                .
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-semibold uppercase text-ink">{ship ? "Livraison" : "Retrait au comptoir"}</h2>
            <div className="mt-3 flex items-start gap-3 text-sm leading-6 text-ink">
              {ship ? <TruckIcon size={20} className="mt-0.5 shrink-0 text-brand-700" /> : <PinIcon size={20} className="mt-0.5 shrink-0 text-brand-700" />}
              {ship ? (
                <p>
                  {addr.firstname} {addr.lastname}
                  {addr.company ? ` (${addr.company})` : ""}
                  <br />
                  {addr.street}
                  {addr.streetAdditional ? <><br />{addr.streetAdditional}</> : null}
                  <br />
                  {addr.postcode} {addr.city}
                </p>
              ) : (
                <p>
                  {site.name}
                  <br />
                  {site.address.street}, {site.address.extra}
                  <br />
                  {site.address.postcode} {site.address.city}
                  <br />
                  <span className="inline-flex items-center gap-1 text-steel">
                    <ClockIcon size={14} /> {site.hours}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6">
            <h2 className="font-display text-2xl font-semibold uppercase text-ink">Une question ?</h2>
            <p className="mt-2 text-sm leading-6 text-steel">
              Notre équipe est joignable du lundi au vendredi, en indiquant votre numéro de commande.
            </p>
            <a href={site.phoneHref} className="mt-3 inline-flex items-center gap-2 font-bold text-ink hover:text-brand-700">
              <PhoneIcon size={18} className="text-brand-700" /> {site.phone}
            </a>
          </div>
        </div>

        <aside className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5">
          <h2 className="font-display text-2xl font-semibold uppercase text-ink">Récapitulatif</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <span>
                  <span className="block font-bold text-ink">{i.name}</span>
                  <span className="block text-xs text-steel">
                    {[i.brandName, i.modelName].filter(Boolean).join(" ")}
                    {i.reference ? ` · Réf. ${i.reference}` : ""} · n° {i.id}
                  </span>
                </span>
                <span className="font-bold text-ink">{formatPrice(i.priceTtc)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-steel">Pièces</dt>
              <dd className="font-semibold text-ink">{formatPrice(Number(order.subtotalTtc))}</dd>
            </div>
            {order.proDiscountRate && (
              <div className="flex justify-between text-brand-700">
                <dt className="font-semibold">Dont remise professionnelle (-{Math.round(Number(order.proDiscountRate) * 100)} %)</dt>
                <dd className="font-semibold">-{formatPrice(discountTotal(order))}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-steel">{ship ? "Livraison" : "Retrait"}</dt>
              <dd className="font-semibold text-ink">{ship ? formatPrice(Number(order.shippingTtc)) : "Gratuit"}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold text-ink">Total TTC</dt>
              <dd className="display-title text-3xl text-ink">{formatPrice(Number(order.totalTtc))}</dd>
            </div>
          </dl>
          {paid && (
            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand-700">
              <CheckIcon size={14} /> Réglé par carte bancaire
            </p>
          )}
          {paid && (
            <Link
              href={`/suivi-commande?ref=${encodeURIComponent(number)}`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-ink-700"
            >
              Suivre ma commande
            </Link>
          )}
          <Link href="/pieces-auto" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-brand hover:text-brand-700">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </>
  );
}
