"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, subscribeCart } from "@/lib/cart";
import { CartIcon } from "@/components/icons";

/** Lien panier de l'en-tête avec le nombre d'articles. */
export function CartLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(getCart().length);
    sync();
    return subscribeCart(sync);
  }, []);
  return (
    <Link
      href="/panier"
      className="relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
    >
      <span className="relative">
        <CartIcon size={22} />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink-900">
            {count}
          </span>
        )}
      </span>
      <span>Panier</span>
    </Link>
  );
}
