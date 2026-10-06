/**
 * Mesure d'audience Google Analytics 4 (et Google Ads plus tard), avec le
 * mode consentement v2 de Google en version « de base » : la balise Google
 * n'est chargée qu'après l'accord du visiteur (bandeau cookies), et aucun
 * événement n'est envoyé sans cet accord.
 *
 * Événements e-commerce GA4 suivis, de la visite à la commande :
 * view_item_list → select_item → view_item → add_to_cart → view_cart →
 * remove_from_cart → begin_checkout → add_shipping_info → add_payment_info →
 * purchase. S'y ajoutent search, generate_lead, login et contact_click.
 * Les pages vues sont envoyées par la mesure améliorée de GA4.
 */
import type { Part } from "@/lib/catalog/types";
import { proPrice } from "@/lib/account/pricing";

export type Consent = { analytics: boolean; ads: boolean; date: string };
export type GaItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_variant?: string;
  price: number;
  quantity: 1;
  index?: number;
  item_list_id?: string;
  item_list_name?: string;
};

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    /** Défini par le script d'amorçage (src/components/analytics/gtag-bootstrap.ts) */
    czGa?: { apply: (consent: Consent) => void };
    /** Vrai une fois GA4 configuré (visiteur d'accord pour la mesure d'audience) */
    czGaReady?: boolean;
  }
}

const CONSENT_KEY = "cazenave.consent.v1";
/** Le choix est redemandé au bout de 6 mois (recommandation CNIL). */
const CONSENT_MAX_AGE_MS = 182 * 24 * 3600 * 1000;
export const CONSENT_EVENT = "cazenave:consent";
export const CONSENT_OPEN_EVENT = "cazenave:consent-open";
export const CURRENCY = "EUR";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (typeof c.analytics !== "boolean" || typeof c.ads !== "boolean") return null;
    if (Date.now() - new Date(c.date).getTime() > CONSENT_MAX_AGE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; ads: boolean }) {
  const consent: Consent = { ...choice, date: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // stockage indisponible : le choix vaut pour la page en cours
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
}

export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** Pièce au format « item » de GA4 (prix public TTC ; remise pro appliquée à l'envoi). */
export function toGaItem(part: Pick<Part, "id" | "name" | "brandName" | "modelName" | "categoryName" | "subCategoryName" | "priceTtc">, index?: number): GaItem {
  return {
    item_id: String(part.id),
    item_name: part.name,
    ...(part.brandName ? { item_brand: part.brandName } : {}),
    ...(part.categoryName ? { item_category: part.categoryName } : {}),
    ...(part.subCategoryName ? { item_category2: part.subCategoryName } : {}),
    ...(part.modelName ? { item_variant: [part.brandName, part.modelName].filter(Boolean).join(" ") } : {}),
    price: part.priceTtc,
    quantity: 1,
    ...(index !== undefined ? { index } : {}),
  };
}

/** Prix réellement affiché au visiteur : tarif pro (-20 %) s'il est connecté en compte pro. */
export function withRate(items: GaItem[], rate: number): GaItem[] {
  return rate > 0 ? items.map((i) => ({ ...i, price: proPrice(i.price, rate) })) : items;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
export const itemsValue = (items: GaItem[]) => round2(items.reduce((s, i) => s + i.price * i.quantity, 0));

/** Derniers envois, pour écarter un doublon immédiat (double clic, composant monté deux fois). */
const recent = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 1500;

/** Envoie un événement GA4, uniquement si le visiteur a accepté la mesure d'audience. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag || !window.czGaReady) return;
  const signature = `${event}:${JSON.stringify(params)}`;
  const now = Date.now();
  if (now - (recent.get(signature) ?? 0) < DUPLICATE_WINDOW_MS) return;
  recent.set(signature, now);
  window.gtag("event", event, params);
}

/** Raccourci pour les événements e-commerce (devise, valeur et articles). */
export function trackItems(event: string, items: GaItem[], extra: Record<string, unknown> = {}) {
  if (items.length === 0) return;
  track(event, { currency: CURRENCY, value: itemsValue(items), items, ...extra });
}

/** Paramètres d'adresse à ne jamais transmettre à Google (jeton de commande, session de paiement, plaque). */
const PRIVATE_PARAMS = ["t", "session_id", "immat", "email"];

export function cleanLocation(href: string): string {
  try {
    const url = new URL(href);
    for (const p of PRIVATE_PARAMS) url.searchParams.delete(p);
    return url.toString();
  } catch {
    return href;
  }
}

/** Listes de produits affichées sur la page, pour l'événement select_item au clic. */
const listedItems = new Map<string, GaItem>();

export function registerListItems(items: GaItem[]) {
  for (const i of items) listedItems.set(i.item_id, i);
}

export function listedItem(id: string): GaItem | undefined {
  return listedItems.get(id);
}
