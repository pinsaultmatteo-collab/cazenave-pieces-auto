"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Bouton du paiement simulé : déclenche le traitement de la commande sans carte. */
export function TestPayButton({ orderRef, token }: { orderRef: string; token: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "paying" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const pay = async () => {
    setState("paying");
    try {
      const res = await fetch("/api/checkout/test-pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: orderRef, t: token }) });
      const json = (await res.json()) as { error?: string; status?: string };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      router.push(`/commande/confirmation?ref=${encodeURIComponent(orderRef)}&t=${encodeURIComponent(token)}`);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={state === "paying"}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:opacity-60"
      >
        {state === "paying" ? "Traitement en cours…" : "Simuler un paiement réussi"}
      </button>
      {message && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
