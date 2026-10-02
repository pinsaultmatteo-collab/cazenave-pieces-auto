"use client";

import { useSyncExternalStore } from "react";
import type { PublicAccount } from "./pricing";

/**
 * Compte connecté côté navigateur : lu une fois par page (/api/account/me),
 * gardé en sessionStorage pour afficher les tarifs pro sans attendre.
 */
type AccountState = { loaded: boolean; account: PublicAccount | null };

const KEY = "cazenave.account.v1";
const SERVER_STATE: AccountState = { loaded: false, account: null };
let state: AccountState = SERVER_STATE;
let fetching = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setAccount(account: PublicAccount | null) {
  state = { loaded: true, account };
  try {
    if (account) sessionStorage.setItem(KEY, JSON.stringify(account));
    else sessionStorage.removeItem(KEY);
  } catch {
    // stockage indisponible : l'état reste en mémoire
  }
  emit();
}

async function refresh() {
  if (fetching) return;
  fetching = true;
  try {
    const res = await fetch("/api/account/me", { cache: "no-store" });
    const json = (await res.json()) as { account: PublicAccount | null };
    setAccount(json.account ?? null);
  } catch {
    state = { ...state, loaded: true };
    emit();
  } finally {
    fetching = false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!state.loaded && !fetching) {
    try {
      const cached = sessionStorage.getItem(KEY);
      if (cached) state = { loaded: false, account: JSON.parse(cached) as PublicAccount };
    } catch {
      // ignoré
    }
    void refresh();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

/** Remise à appliquer aux prix affichés (0 hors compte professionnel). */
export function useDiscountRate(): number {
  const { account } = useAccount();
  return account?.isPro ? account.discountRate : 0;
}

export async function logout() {
  await fetch("/api/account/logout", { method: "POST" }).catch(() => null);
  setAccount(null);
}
