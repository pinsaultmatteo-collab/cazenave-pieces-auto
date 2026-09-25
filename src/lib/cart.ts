"use client";

/**
 * Panier local (navigateur) : liste d'identifiants de pièces Opisto.
 * Une pièce d'occasion est unique, la quantité est donc toujours 1.
 * Le paiement Stripe et la création de commande Opisto se brancheront sur
 * cette liste.
 */
const KEY = "cazenave.cart.v1";
export const CART_EVENT = "cazenave:cart";

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

/** S'abonne aux changements du panier (même onglet et autres onglets). */
export function subscribeCart(cb: () => void) {
  window.addEventListener(CART_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
