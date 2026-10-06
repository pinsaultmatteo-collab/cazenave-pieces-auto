"use client";

import { useEffect, useRef } from "react";
import { CONSENT_EVENT, listedItem, readConsent, track, withRate, type Consent } from "@/lib/analytics";
import { useDiscountRate } from "@/lib/account/client";

/** Supprime les cookies Google (retrait du consentement). */
function deleteGoogleCookies() {
  const host = location.hostname.replace(/^www\./, "");
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
    for (const domain of ["", `; domain=.${host}`, `; domain=${location.hostname}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

function contactMethod(href: string): string | null {
  if (href.startsWith("tel:")) return "telephone";
  if (href.startsWith("sms:")) return "sms";
  if (href.startsWith("mailto:")) return "email";
  if (/wa\.me|whatsapp/i.test(href)) return "whatsapp";
  return null;
}

/**
 * Applique les choix du bandeau cookies pendant la visite et suit les clics
 * utiles : pièce choisie dans une liste (select_item), téléphone, SMS,
 * e-mail ou WhatsApp (contact_click).
 */
export function Analytics() {
  const rate = useDiscountRate();
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    let current = readConsent();
    const onConsent = (e: Event) => {
      const next = (e as CustomEvent<Consent>).detail;
      // Accord retiré : cookies supprimés et page rechargée sans la balise Google
      if ((current?.analytics && !next.analytics) || (current?.ads && !next.ads)) {
        deleteGoogleCookies();
        location.reload();
        return;
      }
      current = next;
      window.czGa?.apply(next);
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const link = target?.closest("a[href]");
      const method = link ? contactMethod(link.getAttribute("href") ?? "") : null;
      if (method) track("contact_click", { method });

      const card = target?.closest<HTMLElement>("[data-ga-item-id]");
      const item = card?.dataset.gaItemId ? listedItem(card.dataset.gaItemId) : undefined;
      if (card && item && link) {
        const list = card.closest<HTMLElement>("[data-ga-list]");
        const listParams = list ? { item_list_id: list.dataset.gaList, item_list_name: list.dataset.gaListName } : {};
        track("select_item", { ...listParams, items: withRate([{ ...item, ...listParams }], rateRef.current) });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
