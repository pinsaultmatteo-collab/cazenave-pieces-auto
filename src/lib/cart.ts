"use client";

/**
 * Panier local (navigateur) : liste d'identifiants de pièces Opisto.
 * Une pièce d'occasion est unique, la quantité est donc toujours 1.
 * Le paiement Stripe et la création de commande Opisto se brancheront sur
 * cette liste.
 */
const KEY = "cazenave.cart.v1";
export const CART_EVENT = "cazenave:cart";
/** Demande d'ouverture du volet panier (après un ajout, par exemple). */
export const CART_OPEN_EVENT = "cazenave:cart-open";

export function openCartDrawer() {
  window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
}

export type CartItem = { id: number; addedAt: string };

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // stockage indisponible (navigation privée) : le panier reste en mémoire de page
  }
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function getCart(): CartItem[] {
  return read();
}

export function isInCart(id: number): boolean {
  return read().some((i) => i.id === id);
}

export function addToCart(id: number) {
  const items = read();
  if (!items.some((i) => i.id === id)) write([...items, { id, addedAt: new Date().toISOString() }]);
}

export function removeFromCart(id: number) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export type DeliveryMode = "pickup" | "shipping";
const DELIVERY_KEY = "cazenave.delivery.v1";

/** Mode de remise choisi dans le panier : retrait au comptoir (gratuit) par défaut. */
export function getDeliveryMode(): DeliveryMode {
  try {
    return localStorage.getItem(DELIVERY_KEY) === "shipping" ? "shipping" : "pickup";
  } catch {
    return "pickup";
  }
}

export function setDeliveryMode(mode: DeliveryMode) {
  try {
    localStorage.setItem(DELIVERY_KEY, mode);
  } catch {
    // stockage indisponible : le choix vaut pour la page en cours
  }
}

/** S'abonne aux changements du panier (même onglet et autres onglets). */
export function subscribeCart(cb: () => void) {
  window.addEventListener(CART_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
