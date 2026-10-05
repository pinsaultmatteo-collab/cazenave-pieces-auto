"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CART_OPEN_EVENT, getCart, removeFromCart, subscribeCart } from "@/lib/cart";
import { partHref } from "@/lib/catalog/links";
import type { Part } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { proPrice } from "@/lib/account/pricing";
import { useDiscountRate } from "@/lib/account/client";
import { Price } from "@/components/catalog/Price";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { site } from "@/lib/site";
import { CartIcon, CheckIcon, CloseIcon, LockIcon, TruckIcon } from "@/components/icons";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Identifiants du panier, synchronisés avec le stockage local. */
function useCartIds(): number[] {
  const key = useSyncExternalStore(
    subscribeCart,
    () => JSON.stringify(getCart().map((i) => i.id)),
    () => "[]",
  );
  const [ids, setIds] = useState<{ key: string; ids: number[] }>({ key: "[]", ids: [] });
  if (ids.key !== key) setIds({ key, ids: JSON.parse(key) as number[] });
  return ids.ids;
}

/** Bouton panier de l'en-tête : ouvre un volet d'aperçu du panier. */
export function CartLink({ paymentEnabled = true }: { paymentEnabled?: boolean }) {
  const ids = useCartIds();
  const count = ids.length;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openDrawer = () => {
    setMounted(true);
    setOpen(true);
  };
  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Ouverture demandée ailleurs sur la page (ajout au panier)
  useEffect(() => {
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CART_OPEN_EVENT, onOpen);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDrawer}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="cart-drawer"
        className="group relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink transition hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
      >
        <span className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
          <CartIcon size={22} />
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink-900"
            >
              {count}
            </motion.span>
          )}
        </span>
        <span>Panier</span>
      </button>
      {mounted && createPortal(<CartDrawer open={open} ids={ids} onClose={close} paymentEnabled={paymentEnabled} />, document.body)}
    </>
  );
}

function CartDrawer({ open, ids, onClose, paymentEnabled }: { open: boolean; ids: number[]; onClose: () => void; paymentEnabled: boolean }) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [fetched, setFetched] = useState<{ key: string; parts: Part[] } | null>(null);
  const idsKey = ids.join(",");

  // Détail des pièces, chargé à l'ouverture et à chaque changement du panier
  useEffect(() => {
    if (!open || !idsKey) return;
    let alive = true;
    fetch(`/api/parts?ids=${idsKey}`)
      .then((r) => r.json() as Promise<{ parts: Part[] }>)
      .then((json) => {
        if (!alive) return;
        const order = new Map(ids.map((id, i) => [id, i]));
        setFetched({ key: idsKey, parts: json.parts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)) });
      })
      .catch(() => {
        if (alive) setFetched({ key: idsKey, parts: [] });
      });
    return () => {
      alive = false;
    };
  }, [open, idsKey, ids]);

  // Page figée, touche Échap, focus sur le bouton de fermeture
  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const loading = ids.length > 0 && (!fetched || fetched.key !== idsKey);
  const parts = !ids.length ? [] : fetched && fetched.key === idsKey ? fetched.parts : [];
  const rate = useDiscountRate();
  const subtotal = parts.reduce((s, p) => s + proPrice(p.priceTtc, rate), 0);
  const allShip = parts.length > 0 && parts.every((p) => p.shippingAvailable);
  const shipping = parts.reduce((s, p) => s + (p.shippingCost ?? 0), 0);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]" data-lenis-prevent>
          <motion.div
            className="absolute inset-0 bg-night/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            id="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu du panier"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl shadow-black/40"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="font-display text-3xl font-semibold uppercase leading-none text-ink">Mon panier</p>
                <p className="mt-1 text-xs text-steel">
                  {ids.length === 0 ? "Aucune pièce" : `${ids.length} pièce${ids.length > 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fermer le panier"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:rotate-90 hover:border-brand hover:bg-brand hover:text-ink-900"
              >
                <CloseIcon size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
              {ids.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-steel">
                    <CartIcon size={28} />
                  </span>
                  <p className="mt-4 font-display text-2xl font-semibold uppercase text-ink">Votre panier est vide</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-steel">Recherchez une pièce par immatriculation, par marque ou par référence.</p>
                  <Link
                    href="/pieces-auto"
                    onClick={onClose}
                    className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400"
                  >
                    Voir le stock
                  </Link>
                </div>
              ) : loading ? (
                <ul className="space-y-4" aria-busy="true">
                  {ids.map((id) => (
                    <li key={id} className="flex gap-3">
                      <span className="h-16 w-20 shrink-0 animate-pulse rounded-xl bg-mist" />
                      <span className="flex-1 space-y-2 pt-1">
                        <span className="block h-3.5 w-3/4 animate-pulse rounded bg-mist" />
                        <span className="block h-3 w-1/2 animate-pulse rounded bg-mist" />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {parts.map((p, i) => (
                      <motion.li
                        key={p.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
                        className="flex gap-3 overflow-hidden py-4 first:pt-0"
                      >
                        <Link href={partHref(p)} onClick={onClose} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
                          {p.vignette ? (
                            <Image src={p.vignette} alt="" fill sizes="80px" className="bg-white object-contain" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[10px] text-steel">Photo à venir</span>
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={partHref(p)} onClick={onClose} className="block truncate text-sm font-bold text-ink hover:text-brand-700">
                            {p.name}
                          </Link>
                          <p className="truncate text-xs text-steel">
                            {[p.brandName, p.modelName].filter(Boolean).join(" ")}
                            {p.manufacturerReference ? ` · Réf. ${p.manufacturerReference}` : ""}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(p.id)}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-steel transition hover:text-red-600"
                            aria-label={`Retirer ${p.name} du panier`}
                          >
                            <CloseIcon size={12} /> Retirer
                          </button>
                        </div>
                        <Price ttc={p.priceTtc} compact className="font-display text-xl font-semibold text-ink" />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {ids.length > 0 && (
              <footer className="border-t border-line bg-mist/60 px-6 py-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-steel">Sous-total</dt>
                    <dd className="font-display text-2xl font-semibold text-ink">{loading ? "…" : formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 text-xs text-steel">
                    <dt className="flex items-center gap-1.5">
                      <TruckIcon size={14} /> Livraison
                    </dt>
                    <dd className="text-right">
                      {loading ? "…" : allShip ? `Retrait gratuit à ${site.address.city}, ou livraison ${formatPrice(shipping)}` : `Retrait gratuit à ${site.address.city}`}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 grid gap-2.5">
                  {paymentEnabled ? (
                    <Link
                      href="/commande"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(152,174,7,0.4)]"
                    >
                      <LockIcon size={18} /> Acheter maintenant
                    </Link>
                  ) : (
                    <span className="flex items-center justify-center gap-2 rounded-full bg-ink-100 px-6 py-4 text-sm font-bold uppercase tracking-wide text-steel">
                      <LockIcon size={18} /> Paiement bientôt disponible
                    </span>
                  )}
                  <Link
                    href="/panier"
                    onClick={onClose}
                    className="flex items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand-700"
                  >
                    Voir mon panier
                  </Link>
                </div>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-steel">
                  <CheckIcon size={13} className="text-brand" /> Paiement sécurisé · Pièces garanties 12 mois
                </p>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
