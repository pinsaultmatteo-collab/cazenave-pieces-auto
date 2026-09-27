"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

/** Vide le panier local une fois la commande payée. */
export function ClearCart() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
