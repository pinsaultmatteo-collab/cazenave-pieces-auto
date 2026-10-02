"use client";

import { proPrice } from "@/lib/account/pricing";
import { useDiscountRate } from "@/lib/account/client";
import { formatPrice } from "@/lib/format";

/**
 * Prix d'une pièce. Pour un compte professionnel connecté : prix public
 * barré, pastille de remise, puis prix pro. Le rendu serveur (et Google)
 * voit toujours le prix public.
 */
export function Price({ ttc, className = "display-title text-3xl text-ink", compact = false }: { ttc: number; className?: string; compact?: boolean }) {
  const rate = useDiscountRate();
  if (!rate) return <span className={className}>{formatPrice(ttc)}</span>;
  return (
    <span className={compact ? "inline-flex items-baseline gap-1.5" : "flex flex-col"}>
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        <s className="text-steel">{formatPrice(ttc)}</s>
        {!compact && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-900">-{Math.round(rate * 100)} % pro</span>}
      </span>
      <span className={className}>{formatPrice(proPrice(ttc, rate))}</span>
    </span>
  );
}

/** Montant seul (HT par exemple), remisé pour un compte professionnel. */
export function ProAmount({ value }: { value: number }) {
  const rate = useDiscountRate();
  return <>{formatPrice(proPrice(value, rate))}</>;
}
