"use client";

/**
 * Blocage du défilement de la page (volets, fenêtres) : fige la page et
 * prévient le défilement fluide (SmoothScroll) de se mettre en pause.
 */
export const SCROLL_LOCK_EVENT = "cazenave:scroll-lock";

let locks = 0;

export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    document.documentElement.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: true }));
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = "";
    window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: false }));
  }
}
