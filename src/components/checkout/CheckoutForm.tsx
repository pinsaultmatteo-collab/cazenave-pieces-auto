"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getCart, getDeliveryMode, setDeliveryMode as saveDeliveryMode, subscribeCart, type DeliveryMode } from "@/lib/cart";
import type { Part } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { proPrice } from "@/lib/account/pricing";
import { useAccount, useDiscountRate } from "@/lib/account/client";
import { Price } from "@/components/catalog/Price";
import { site } from "@/lib/site";
import { checkoutSchema, type CheckoutInput } from "@/lib/orders/schema";
import { CheckIcon, LockIcon, PinIcon, TruckIcon } from "@/components/icons";
import { PartPhoto } from "@/components/catalog/PartPhoto";

type Address = { firstname: string; lastname: string; company: string; phone: string; street: string; streetAdditional: string; postcode: string; city: string };
const EMPTY_ADDRESS: Address = { firstname: "", lastname: "", company: "", phone: "", street: "", streetAdditional: "", postcode: "", city: "" };

type Errors = Record<string, string>;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-steel/70 focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-red-500";

function Field({ label, name, error, children, hint }: { label: string; name: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-steel">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function AddressFields({ prefix, value, onChange, errors }: { prefix: string; value: Address; onChange: (v: Address) => void; errors: Errors }) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  const err = (k: keyof Address) => errors[`${prefix}.${k}`];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Prénom" name={`${prefix}-firstname`} error={err("firstname")}>
        <input id={`${prefix}-firstname`} autoComplete="given-name" className={field} value={value.firstname} onChange={set("firstname")} aria-invalid={!!err("firstname")} />
      </Field>
      <Field label="Nom" name={`${prefix}-lastname`} error={err("lastname")}>
        <input id={`${prefix}-lastname`} autoComplete="family-name" className={field} value={value.lastname} onChange={set("lastname")} aria-invalid={!!err("lastname")} />
      </Field>
      <Field label="Société (facultatif)" name={`${prefix}-company`} error={err("company")}>
        <input id={`${prefix}-company`} autoComplete="organization" className={field} value={value.company} onChange={set("company")} />
      </Field>
      <Field label="Téléphone" name={`${prefix}-phone`} error={err("phone")} hint="Pour vous joindre au sujet de la commande">
        <input id={`${prefix}-phone`} type="tel" autoComplete="tel" className={field} value={value.phone} onChange={set("phone")} aria-invalid={!!err("phone")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Adresse" name={`${prefix}-street`} error={err("street")}>
          <input id={`${prefix}-street`} autoComplete="address-line1" className={field} value={value.street} onChange={set("street")} aria-invalid={!!err("street")} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Complément d'adresse (facultatif)" name={`${prefix}-streetAdditional`} error={err("streetAdditional")}>
          <input id={`${prefix}-streetAdditional`} autoComplete="address-line2" className={field} value={value.streetAdditional} onChange={set("streetAdditional")} />
        </Field>
      </div>
      <Field label="Code postal" name={`${prefix}-postcode`} error={err("postcode")}>
        <input id={`${prefix}-postcode`} inputMode="numeric" autoComplete="postal-code" className={field} value={value.postcode} onChange={set("postcode")} aria-invalid={!!err("postcode")} />
      </Field>
      <Field label="Ville" name={`${prefix}-city`} error={err("city")}>
        <input id={`${prefix}-city`} autoComplete="address-level2" className={field} value={value.city} onChange={set("city")} aria-invalid={!!err("city")} />
      </Field>
    </div>
  );
}

/** Tunnel de commande : coordonnées, mode de livraison, récapitulatif, puis paiement. */
export function CheckoutForm({ cancelled }: { cancelled?: string }) {
  // Identifiants du panier (stockage local), puis détail des pièces via l'API.
  const idsKey = useSyncExternalStore(
    subscribeCart,
    () => JSON.stringify(getCart().map((i) => i.id)),
    () => "[]",
  );
  const ids = useMemo(() => JSON.parse(idsKey) as number[], [idsKey]);
  const [fetched, setFetched] = useState<{ key: string; parts: Part[] } | null>(null);
  useEffect(() => {
    if (ids.length === 0) return;
    let alive = true;
    fetch(`/api/parts?ids=${ids.join(",")}`)
      .then((res) => res.json() as Promise<{ parts: Part[] }>)
      .then((json) => {
        if (alive) setFetched({ key: idsKey, parts: json.parts });
      })
      .catch(() => {
        if (alive) setFetched({ key: idsKey, parts: [] });
      });
    return () => {
      alive = false;
    };
  }, [ids, idsKey]);
  const parts = useMemo<Part[] | null>(() => (ids.length === 0 ? [] : fetched && fetched.key === idsKey ? fetched.parts : null), [ids, fetched, idsKey]);

  const [typedEmail, setTypedEmail] = useState<string | null>(null);
  // Client connecté : e-mail du compte proposé par défaut
  const { account } = useAccount();
  const email = typedEmail ?? account?.email ?? "";
  const [billing, setBilling] = useState<Address>(EMPTY_ADDRESS);
  const [delivery, setDelivery] = useState<Address>(EMPTY_ADDRESS);
  const [shipToBilling, setShipToBilling] = useState(true);
  // Choix fait dans le panier (retrait au comptoir par défaut).
  const [deliveryMode, setDeliveryModeState] = useState<DeliveryMode>(() => (typeof window === "undefined" ? "pickup" : getDeliveryMode()));
  const setDeliveryMode = (m: DeliveryMode) => {
    setDeliveryModeState(m);
    saveDeliveryMode(m);
  };
  const [note, setNote] = useState("");
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const canShip = useMemo(() => (parts ?? []).every((p) => p.shippingAvailable), [parts]);
  // Mode effectif : la livraison n'est proposée que si toutes les pièces s'expédient.
  const mode: "pickup" | "shipping" = canShip ? deliveryMode : "pickup";

  const rate = useDiscountRate();
  const listTotal = (parts ?? []).reduce((s, p) => s + p.priceTtc, 0);
  const subtotal = (parts ?? []).reduce((s, p) => s + proPrice(p.priceTtc, rate), 0);
  const shipping = mode === "shipping" ? (parts ?? []).reduce((s, p) => s + (p.shippingCost ?? 0), 0) : 0;
  const total = subtotal + shipping;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parts?.length) return;
    setServerError(null);
    const input: CheckoutInput = {
      email,
      items: parts.map((p) => p.id),
      deliveryMode: mode,
      billing: { ...billing, country: "FR" },
      shipToBilling,
      delivery: mode === "shipping" && !shipToBilling ? { ...delivery, country: "FR" } : undefined,
      note,
      acceptCgv: acceptCgv as true,
      website: "",
    };
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] = issue.message;
      setErrors(next);
      const first = document.querySelector('[aria-invalid="true"], [role="alert"]');
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const json = (await res.json()) as { url?: string; error?: string; code?: string; details?: { ids?: number[] } };
      if (!res.ok || !json.url) {
        setServerError(json.error ?? "Le paiement n'a pas pu démarrer.");
        setSubmitting(false);
        return;
      }
      window.location.assign(json.url);
    } catch {
      setServerError("Connexion impossible, merci de réessayer.");
      setSubmitting(false);
    }
  };

  if (parts === null) return <p className="text-sm text-steel">Chargement de votre panier…</p>;
  if (parts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
        <p className="font-display text-3xl font-semibold uppercase text-ink">Votre panier est vide</p>
        <Link href="/pieces-auto" className="mt-6 inline-flex rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
          Voir le stock
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-start">
      <div className="space-y-8">
        {cancelled && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Le paiement a été interrompu. Vos pièces sont toujours dans le panier, vous pouvez réessayer.
          </p>
        )}

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold uppercase text-ink">1. Vos coordonnées</h2>
          <div className="mt-5 grid gap-4">
            <Field label="Adresse e-mail" name="email" error={errors.email} hint="Confirmation et suivi de commande">
              <input id="email" type="email" autoComplete="email" className={field} value={email} onChange={(e) => setTypedEmail(e.target.value)} aria-invalid={!!errors.email} />
            </Field>
            <AddressFields prefix="billing" value={billing} onChange={setBilling} errors={errors} />
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold uppercase text-ink">2. Retrait ou livraison</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${mode === "shipping" ? "border-brand bg-brand-50" : "border-line hover:border-brand/50"} ${canShip ? "" : "opacity-50"}`}>
              <input type="radio" name="deliveryMode" className="mt-1 accent-brand-700" checked={mode === "shipping"} disabled={!canShip} onChange={() => setDeliveryMode("shipping")} />
              <span>
                <span className="flex items-center gap-2 font-bold text-ink">
                  <TruckIcon size={18} className="text-brand-700" /> Livraison à domicile
                </span>
                <span className="mt-1 block text-xs leading-5 text-steel">
                  Expédition sous 24/48 h ouvrées partout en France. {canShip ? `Frais : ${formatPrice((parts ?? []).reduce((s, p) => s + (p.shippingCost ?? 0), 0))}` : "Indisponible pour une des pièces (volume ou poids)."}
                </span>
              </span>
            </label>
            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${mode === "pickup" ? "border-brand bg-brand-50" : "border-line hover:border-brand/50"}`}>
              <input type="radio" name="deliveryMode" className="mt-1 accent-brand-700" checked={mode === "pickup"} onChange={() => setDeliveryMode("pickup")} />
              <span>
                <span className="flex items-center gap-2 font-bold text-ink">
                  <PinIcon size={18} className="text-brand-700" /> Retrait au comptoir
                </span>
                <span className="mt-1 block text-xs leading-5 text-steel">
                  Gratuit. {site.address.street}, {site.address.postcode} {site.address.city}. {site.hours}.
                </span>
              </span>
            </label>
          </div>

          {mode === "shipping" && (
            <div className="mt-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" className="accent-brand-700" checked={shipToBilling} onChange={(e) => setShipToBilling(e.target.checked)} />
                Livrer à l&apos;adresse ci-dessus
              </label>
              {!shipToBilling && (
                <div className="mt-4 rounded-2xl bg-mist p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-steel">Adresse de livraison</p>
                  <AddressFields prefix="delivery" value={delivery} onChange={setDelivery} errors={errors} />
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <Field label="Message pour l'atelier (facultatif)" name="note" error={errors.note}>
              <textarea id="note" rows={2} className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Créneau de passage, précision sur la pièce…" />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="font-display text-2xl font-semibold uppercase text-ink">3. Paiement</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Vous allez être redirigé vers notre page de paiement sécurisé (carte bancaire). Aucune donnée bancaire ne transite par notre site.
          </p>
          <label className="mt-5 flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" className="mt-1 accent-brand-700" checked={acceptCgv} onChange={(e) => setAcceptCgv(e.target.checked)} aria-invalid={!!errors.acceptCgv} />
            <span>
              J&apos;ai lu et j&apos;accepte les{" "}
              <Link href="/conditions-generales-de-vente" target="_blank" className="font-semibold text-brand-700 underline">
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link href="/garantie" target="_blank" className="font-semibold text-brand-700 underline">
                garantie 12 mois
              </Link>
              .
            </span>
          </label>
          {errors.acceptCgv && (
            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
              {errors.acceptCgv}
            </p>
          )}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          {serverError && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:cursor-wait disabled:opacity-60"
          >
            <LockIcon size={18} /> {submitting ? "Redirection vers le paiement…" : `Payer ${formatPrice(total)}`}
          </button>
        </section>
      </div>

      <aside className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 lg:sticky lg:top-48">
        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Votre commande</h2>
        <ul className="mt-4 divide-y divide-line">
          {parts.map((p) => (
            <li key={p.id} className="flex gap-3 py-3">
              <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                {p.vignette && <PartPhoto src={p.vignette} alt="" fill sizes="80px" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
                <span className="block truncate text-xs text-steel">
                  {[p.brandName, p.modelName].filter(Boolean).join(" ")}
                  {p.manufacturerReference ? ` · Réf. ${p.manufacturerReference}` : ""}
                </span>
              </span>
              <Price ttc={p.priceTtc} compact className="text-sm font-bold text-ink" />
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-steel">Pièces ({parts.length})</dt>
            <dd className="font-semibold text-ink">{formatPrice(listTotal)}</dd>
          </div>
          {rate > 0 && (
            <div className="flex justify-between text-brand-700">
              <dt className="font-semibold">Remise professionnelle (-{Math.round(rate * 100)} %)</dt>
              <dd className="font-semibold">-{formatPrice(listTotal - subtotal)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-steel">{mode === "shipping" ? "Livraison" : "Retrait au comptoir"}</dt>
            <dd className="font-semibold text-ink">{mode === "shipping" ? formatPrice(shipping) : "Gratuit"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold text-ink">Total TTC</dt>
            <dd className="display-title text-3xl text-ink">{formatPrice(total)}</dd>
          </div>
        </dl>
        <ul className="mt-5 space-y-1.5 text-xs text-steel">
          {["Pièces testées, garanties 12 mois", "Paiement sécurisé par carte bancaire", "Retour possible sous 14 jours"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckIcon size={14} className="text-brand" /> {t}
            </li>
          ))}
        </ul>
        <Link href="/panier" className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">
          Modifier le panier
        </Link>
      </aside>
    </form>
  );
}
