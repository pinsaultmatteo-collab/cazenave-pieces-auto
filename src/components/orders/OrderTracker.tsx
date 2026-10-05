"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { TrackedOrder, TrackStage } from "@/lib/orders/track";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { CheckIcon, ClockIcon, PhoneIcon, PinIcon, SearchIcon, TruckIcon } from "@/components/icons";
import { PartPhoto } from "@/components/catalog/PartPhoto";

const EASE = [0.16, 1, 0.3, 1] as const;
const inputBase =
  "block h-12 w-full rounded-xl border border-line bg-mist/60 px-4 text-sm text-ink outline-none transition placeholder:text-steel/80 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15";

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Étapes affichées selon le mode de retrait. */
function steps(order: TrackedOrder) {
  const ship = order.deliveryMode === "shipping";
  const order_: TrackStage[] = ship ? ["pending", "paid", "preparing", "shipped"] : ["pending", "paid", "ready"];
  const labels: Record<TrackStage, string> = {
    pending: "Commande reçue",
    paid: "Paiement confirmé",
    preparing: "En préparation",
    ready: "Prête au retrait",
    shipped: "Expédiée",
    returned: "Retournée",
    cancelled: "Annulée",
  };
  const current = order_.indexOf(order.stage);
  return order_.map((s, i) => ({ key: s, label: labels[s], done: i <= current, current: i === current }));
}

function headline(order: TrackedOrder) {
  switch (order.stage) {
    case "pending":
      return order.source === "site"
        ? { title: "Paiement non finalisé", text: "Nous n'avons pas reçu le paiement de cette commande. Vous pouvez la reprendre depuis votre panier, ou nous appeler." }
        : { title: "En attente de règlement", text: "Cette commande n'est pas encore réglée. Appelez-nous pour la finaliser." };
    case "cancelled":
      return order.paidAt || order.source === "opisto"
        ? { title: "Commande annulée", text: "Cette commande a été annulée. Appelez-nous pour toute question sur son remboursement." }
        : { title: "Commande annulée", text: "Le paiement n'a pas abouti et la commande a été annulée. Aucun montant n'a été débité." };
    case "returned":
      return { title: "Commande retournée", text: "Nous avons enregistré le retour de cette commande. Appelez-nous pour toute question." };
    case "paid":
      return { title: "Paiement confirmé", text: "Votre paiement est bien reçu, notre équipe enregistre la commande." };
    case "preparing":
      return {
        title: "Commande en préparation",
        text: `Nous préparons et emballons vos pièces. Expédition sous ${order.delay ? `${order.delay.min} à ${order.delay.max}` : "1 à 3"} jours ouvrés, le numéro de suivi apparaîtra ici.`,
      };
    case "ready":
      return { title: "Prête au retrait", text: "Vos pièces sont mises de côté au comptoir de Colomiers. Présentez votre numéro de commande lors du retrait." };
    case "shipped":
      return { title: "Commande expédiée", text: "Vos pièces sont en route. Suivez le colis avec le numéro ci-dessous." };
  }
}

/** Formulaire de suivi (numéro de transaction + e-mail) et affichage de l'état de la commande. */
export function OrderTracker({ initialRef = "", initialEmail = "" }: { initialRef?: string; initialEmail?: string }) {
  const [ref, setRef] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; message?: string }>({ status: "idle" });
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState({ status: "error", message: "Indiquez votre numéro de commande et l'e-mail utilisé pour commander." });
      return;
    }
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref, email }) });
      const json = (await res.json()) as { order?: TrackedOrder; error?: string };
      if (!res.ok || !json.order) throw new Error(json.error ?? "Recherche impossible");
      setOrder(json.order);
      setState({ status: "idle" });
    } catch (err) {
      setOrder(null);
      setState({ status: "error", message: err instanceof Error ? err.message : "Recherche impossible" });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8 lg:sticky lg:top-48">
        <p className="font-display text-2xl font-semibold uppercase text-ink">Retrouver ma commande</p>
        <p className="mt-2 text-sm leading-6 text-steel">
          Le numéro de commande (numéro de transaction) figure sur la page de confirmation, dans l&apos;e-mail envoyé après votre paiement et
          sur votre facture.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="track-ref" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel">
              Numéro de commande
            </label>
            <input
              id="track-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              placeholder="Ex. 32098516"
              inputMode="numeric"
              autoCapitalize="characters"
              autoComplete="off"
              className={`${inputBase} font-display text-lg tracking-[0.15em]`}
            />
          </div>
          <div>
            <label htmlFor="track-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel">
              E-mail utilisé pour la commande
            </label>
            <input id="track-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className={inputBase} />
          </div>
          <AnimatePresence>
            {state.status === "error" && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.message}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:opacity-60"
          >
            <SearchIcon size={18} /> {state.status === "loading" ? "Recherche…" : "Suivre ma commande"}
          </button>
        </form>
        <p className="mt-5 border-t border-line pt-5 text-xs leading-5 text-steel">
          Commande passée au comptoir, par téléphone ou sur une plateforme : le numéro de transaction de votre facture fonctionne aussi. Une
          question ? Appelez-nous au{" "}
          <a href={site.phoneHref} className="font-bold text-ink">
            {site.phone}
          </a>
          , {site.hoursShort.toLowerCase()}.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {order ? (
          <motion.div key={order.ref} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="space-y-6">
            <OrderView order={order} />
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist text-steel">
              <TruckIcon size={30} />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold uppercase text-ink">Où en est ma commande ?</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-steel">
              Saisissez votre numéro de commande et votre e-mail : vous verrez l&apos;état de la commande, le numéro de suivi du colis et votre
              facture dès qu&apos;elle est disponible.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderView({ order }: { order: TrackedOrder }) {
  const ship = order.deliveryMode === "shipping";
  const head = headline(order);
  const list = steps(order);
  const inactive = order.stage === "pending" || order.stage === "cancelled" || order.stage === "returned";

  return (
    <>
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">Commande n° {order.ref}</p>
            <p className="display-title mt-2 text-3xl text-ink sm:text-4xl">{head.title}</p>
          </div>
          <p className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-steel">Passée le {dateFr(order.createdAt)}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-steel">{head.text}</p>

        {!inactive && (
          <ol className="mt-8 grid gap-4 sm:flex sm:items-start sm:gap-0">
            {list.map((s, i) => (
              <li key={s.key} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:text-center">
                {i > 0 && (
                  <span aria-hidden className="absolute left-[1.05rem] top-[-1rem] h-4 w-0.5 bg-line sm:left-[-50%] sm:right-1/2 sm:top-[1.05rem] sm:h-0.5 sm:w-auto">
                    <motion.span
                      className="block h-full w-full origin-top bg-brand sm:origin-left"
                      initial={{ scaleX: 0, scaleY: 0 }}
                      animate={{ scaleX: s.done ? 1 : 0, scaleY: s.done ? 1 : 0 }}
                      transition={{ delay: 0.2 + i * 0.2, duration: 0.5, ease: EASE }}
                    />
                  </span>
                )}
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.2, type: "spring", stiffness: 300, damping: 18 }}
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                    s.done ? "border-brand bg-brand text-ink-900" : "border-line bg-white text-steel"
                  } ${s.current ? "ring-4 ring-brand/25" : ""}`}
                >
                  {s.done ? <CheckIcon size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </motion.span>
                <span className={`text-sm font-semibold sm:mt-2 sm:text-xs ${s.done ? "text-ink" : "text-steel"}`}>{s.label}</span>
              </li>
            ))}
          </ol>
        )}

        {order.stage === "pending" && order.source === "site" && (
          <Link href="/panier" className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
            Reprendre ma commande
          </Link>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-6">
          <p className="flex items-center gap-2 font-display text-xl font-semibold uppercase text-ink">
            {ship ? <TruckIcon size={20} className="text-brand-700" /> : <PinIcon size={20} className="text-brand-700" />}
            {ship ? "Livraison" : "Retrait au comptoir"}
          </p>
          {ship ? (
            <div className="mt-3 space-y-2 text-sm leading-6 text-ink">
              {order.deliveryTo && (
                <p>
                  {order.deliveryTo.name}
                  <br />
                  {order.deliveryTo.postcode} {order.deliveryTo.city}
                </p>
              )}
              {order.tracking ? (
                <p className="rounded-xl bg-brand-50 px-3 py-2">
                  {order.tracking.transporter ? `${order.tracking.transporter} · ` : ""}n° de colis <strong className="font-bold">{order.tracking.number}</strong>
                </p>
              ) : (
                <p className="text-steel">Le numéro de suivi s&apos;affichera ici dès l&apos;expédition.</p>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-1 text-sm leading-6 text-ink">
              <p>
                {site.address.street}, {site.address.extra}
                <br />
                {site.address.postcode} {site.address.city}
              </p>
              <p className="flex items-center gap-1.5 text-steel">
                <ClockIcon size={14} /> {site.hours}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-white p-6">
          <p className="font-display text-xl font-semibold uppercase text-ink">Facture</p>
          {order.invoiceUrl ? (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-700"
            >
              Télécharger la facture
            </a>
          ) : (
            <p className="mt-3 text-sm leading-6 text-steel">
              {inactive ? "Aucune facture disponible pour cette commande." : "Votre facture sera disponible ici après la préparation de la commande."}
            </p>
          )}
          <a href={site.phoneHref} className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand-700">
            <PhoneIcon size={16} className="text-brand-700" /> Une question : {site.phone}
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6">
        <p className="font-display text-xl font-semibold uppercase text-ink">Contenu de la commande</p>
        <ul className="mt-4 divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-mist">
                {i.photo && <PartPhoto src={i.photo} alt="" fill sizes="80px" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{i.name}</span>
                <span className="block truncate text-xs text-steel">
                  {[i.brandName, i.modelName].filter(Boolean).join(" ")}
                  {i.reference ? ` · Réf. ${i.reference}` : ""}
                </span>
              </span>
              <span className="text-sm font-bold text-ink">{formatPrice(i.priceTtc)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-steel">Pièces</dt>
            <dd className="font-semibold text-ink">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-steel">{ship ? "Livraison" : "Retrait"}</dt>
            <dd className="font-semibold text-ink">{ship ? formatPrice(order.shipping) : "Gratuit"}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base">
            <dt className="font-bold text-ink">Total TTC</dt>
            <dd className="display-title text-2xl text-ink">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
