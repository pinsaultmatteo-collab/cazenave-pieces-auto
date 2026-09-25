"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart, isInCart, subscribeCart } from "@/lib/cart";
import { CartIcon, CheckIcon } from "@/components/icons";

export function AddToCartButton({ partId, available }: { partId: number; available: boolean }) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(isInCart(partId));
    sync();
    return subscribeCart(sync);
  }, [partId]);

  if (!available) {
    return (
      <button type="button" disabled className="w-full rounded-full bg-ink-100 px-6 py-4 text-sm font-bold uppercase tracking-wide text-steel">
        Pièce indisponible
      </button>
    );
  }

  if (inCart) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <span className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-700">
          <CheckIcon size={18} /> Dans votre panier
        </span>
        <Link href="/panier" className="flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700">
          Voir le panier
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(partId)}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(152,174,7,0.4)]"
    >
      <CartIcon size={20} /> Ajouter au panier
    </button>
  );
}
