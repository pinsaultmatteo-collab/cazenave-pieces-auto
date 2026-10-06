"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCart, getDeliveryMode, removeFromCart, setDeliveryMode, subscribeCart, type DeliveryMode } from "@/lib/cart";
import { partHref } from "@/lib/catalog/links";
import type { Part } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { proPrice } from "@/lib/account/pricing";
import { useDiscountRate } from "@/lib/account/client";
import { Price } from "./Price";
import { site } from "@/lib/site";
import { CloseIcon, LockIcon, PinIcon, TruckIcon } from "@/components/icons";
import { PartPhoto } from "@/components/catalog/PartPhoto";
import { toGaItem, trackItems, withRate } from "@/lib/analytics";

type State = { loading: boolean; parts: Part[] };

/** Contenu du panier (identifiants en local, détails via l'API). */
export function CartView({ paymentEnabled = true }: { paymentEnabled?: boolean }) {
  const [state, setState] = useState<State>({ loading: true, parts: [] });
  const rate = useDiscountRate();
  // Retrait au comptoir par défaut ; le récapitulatif ne s'affiche qu'après le chargement, côté navigateur.
  const [mode, setMode] = useState<DeliveryMode>(() => (typeof window === "undefined" ? "pickup" : getDeliveryMode()));
  const choose = (m: DeliveryMode) => {
    setMode(m);
    setDeliveryMode(m);
  };

  useEffect(() => {
    let alive = true;
    async function load() {
      const ids = getCart().map((i) => i.id);
      if (ids.length === 0) {
        if (alive) setState({ loading: false, parts: [] });
        return;
      }
      try {
        const res = await fetch(`/api/parts?ids=${ids.join(",")}`);
        const json = (await res.json()) as { parts: Part[] };
        const order = new Map(ids.map((id, i) => [id, i]));
        if (alive) setState({ loading: false, parts: json.parts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) });
      } catch {
        if (alive) setState({ loading: false, parts: [] });
      }
    }
    load();
    return subscribeCart(load) && (() => {
      alive = false;
    });
  }, []);

  // Panier consulté : un envoi par visite de la page
  const viewed = useRef(false);
  useEffect(() => {
    if (state.loading || viewed.current || state.parts.length === 0) return;
    viewed.current = true;
    trackItems("view_cart", withRate(state.parts.map((p, i) => toGaItem(p, i)), rate));
  }, [state, rate]);

  if (state.loading) {
    return <p className="text-sm text-steel">Chargement du panier…</p>;
  }

  if (state.parts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
        <p className="font-display text-3xl font-semibold uppercase text-ink">Votre panier est vide</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-steel">
          Recherchez une pièce par immatriculation, par marque et modèle, ou par référence.
        </p>
        <Link href="/pieces-auto" className="mt-6 inline-flex rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
          Voir le stock
        </Link>
      </div>
    );
  }

  const listTotal = state.parts.reduce((s, p) => s + p.priceTtc, 0);
  const subtotal = state.parts.reduce((s, p) => s + proPrice(p.priceTtc, rate), 0);
  const shipping = state.parts.reduce((s, p) => s + (p.shippingCost ?? 0), 0);
  const canShip = state.parts.every((p) => p.shippingAvailable);
  const ship = canShip && mode === "shipping";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
      <ul className="space-y-4">
        {state.parts.map((p) => (
          <li key={p.id} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
            <Link href={partHref(p)} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-mist">
              {p.vignette && <PartPhoto src={p.vignette} alt="" fill sizes="128px" />}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{p.categoryName}</p>
              <Link href={partHref(p)} className="mt-0.5 block font-display text-xl font-semibold uppercase leading-none text-ink hover:text-brand-700">
                {p.name}
              </Link>
              <p className="mt-1 text-sm text-steel">
                {[p.brandName, p.modelName].filter(Boolean).join(" ")}
                {p.manufacturerReference ? ` · Réf. ${p.manufacturerReference}` : ""}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-steel">
                <TruckIcon size={14} />
                {p.shippingAvailable ? `Livraison ${p.shippingCost ? formatPrice(p.shippingCost) : "incluse"}` : "Retrait sur place ou devis transport"}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <Price ttc={p.priceTtc} className="display-title text-2xl text-ink" />
              <button type="button" onClick={() => {
                  trackItems("remove_from_cart", withRate([toGaItem(p)], rate));
                  removeFromCart(p.id);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-steel hover:text-red-600" aria-label={`Retirer ${p.name} du panier`}>
                <CloseIcon size={14} /> Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5">
        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Récapitulatif</h2>
        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Retrait ou livraison</legend>
          {(
            [
              { value: "pickup", icon: PinIcon, label: "Retrait au comptoir", detail: `Gratuit · ${site.address.city}`, disabled: false },
              {
                value: "shipping",
                icon: TruckIcon,
                label: "Livraison à domicile",
                detail: canShip ? `+ ${formatPrice(shipping)} · 24/48 h` : "Sur devis pour une des pièces",
                disabled: !canShip,
              },
            ] as const
          ).map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                (o.value === "shipping" ? ship : !ship) ? "border-brand bg-brand-50" : "border-line"
              } ${o.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-brand/50"}`}
            >
              <input
                type="radio"
                name="cart-delivery"
                className="accent-brand-700"
                checked={o.value === "shipping" ? ship : !ship}
                disabled={o.disabled}
                onChange={() => choose(o.value)}
              />
              <o.icon size={16} className="shrink-0 text-brand-700" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{o.label}</span>
                <span className="block text-xs text-steel">{o.detail}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-steel">Pièces ({state.parts.length})</dt>
            <dd className="font-semibold text-ink">{formatPrice(listTotal)}</dd>
          </div>
          {rate > 0 && (
            <div className="flex justify-between text-brand-700">
              <dt className="font-semibold">Remise professionnelle (-{Math.round(rate * 100)} %)</dt>
              <dd className="font-semibold">-{formatPrice(listTotal - subtotal)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-steel">{ship ? "Livraison" : "Retrait au comptoir"}</dt>
            <dd className="font-semibold text-ink">{ship ? formatPrice(shipping) : "Gratuit"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold text-ink">Total TTC</dt>
            <dd className="display-title text-3xl text-ink">{formatPrice(subtotal + (ship ? shipping : 0))}</dd>
          </div>
        </dl>
        {paymentEnabled ? (
          <Link
            href="/commande"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(152,174,7,0.4)]"
          >
            <LockIcon size={18} /> Commander et payer
          </Link>
        ) : (
          <button type="button" disabled className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink-100 px-6 py-4 text-sm font-bold uppercase tracking-wide text-steel" title="Le paiement en ligne sera disponible à l'ouverture du site">
            <LockIcon size={18} /> Paiement en ligne bientôt disponible
          </button>
        )}
        <p className="mt-4 text-xs leading-5 text-steel">
          {paymentEnabled ? "Paiement sécurisé par carte bancaire. Vous pouvez aussi réserver" : "En attendant, réservez"} ces pièces par téléphone au{" "}
          <a href={site.phoneHref} className="font-bold text-ink">
            {site.phone}
          </a>{" "}
          ou par SMS au{" "}
          <a href={site.smsHref} className="font-bold text-ink">
            {site.sms}
          </a>{" "}
          en indiquant les identifiants : {state.parts.map((p) => p.id).join(", ")}.
        </p>
      </aside>
    </div>
  );
}
