"use client";

import { useEffect } from "react";
import { CURRENCY, registerListItems, track, trackItems, withRate, type GaItem } from "@/lib/analytics";
import { useDiscountRate } from "@/lib/account/client";

/** Liste de pièces affichée (view_item_list) ; les clics donnent select_item (voir Analytics). */
export function TrackItemList({ id, name, items }: { id: string; name: string; items: GaItem[] }) {
  const rate = useDiscountRate();
  const key = items.map((i) => i.item_id).join(",");
  useEffect(() => {
    registerListItems(items);
    trackItems("view_item_list", withRate(items.map((i) => ({ ...i, item_list_id: id, item_list_name: name })), rate), { item_list_id: id, item_list_name: name });
    // Un envoi par liste affichée (page, filtres, pagination), pas à chaque rendu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name, key]);
  return null;
}

/** Fiche produit consultée (view_item). */
export function TrackViewItem({ item }: { item: GaItem }) {
  const rate = useDiscountRate();
  useEffect(() => {
    trackItems("view_item", withRate([item], rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.item_id]);
  return null;
}

const PURCHASES_KEY = "cazenave.ga-purchases";

/** Commande payée (purchase), envoyée une seule fois même si la page est rechargée. */
export function TrackPurchase({ transactionId, value, shipping, items, discount }: { transactionId: string; value: number; shipping: number; items: GaItem[]; discount?: number }) {
  useEffect(() => {
    let sent: string[] = [];
    try {
      sent = JSON.parse(localStorage.getItem(PURCHASES_KEY) ?? "[]") as string[];
    } catch {
      sent = [];
    }
    if (sent.includes(transactionId) || !window.czGaReady) return;
    track("purchase", {
      transaction_id: transactionId,
      currency: CURRENCY,
      value,
      shipping,
      ...(discount ? { discount, coupon: "TARIF_PRO" } : {}),
      items,
    });
    try {
      localStorage.setItem(PURCHASES_KEY, JSON.stringify([...sent, transactionId].slice(-50)));
    } catch {
      // stockage indisponible : GA4 écarte de toute façon les doublons de transaction_id
    }
  }, [transactionId, value, shipping, items, discount]);
  return null;
}
