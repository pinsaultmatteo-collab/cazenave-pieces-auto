"use client";

import { useState } from "react";
import { SearchIcon } from "@/components/icons";
import { PLACEHOLDER_BRANDS } from "@/lib/placeholders";

type Tab = "immat" | "modele" | "reference";

const tabs: { id: Tab; label: string }[] = [
  { id: "immat", label: "Immatriculation" },
  { id: "modele", label: "Marque et modèle" },
  { id: "reference", label: "Référence" },
];

export function HeroSearch() {
  const [tab, setTab] = useState<Tab>("immat");

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xl shadow-ink/10 sm:p-7">
      <div role="tablist" aria-label="Mode de recherche" className="flex gap-1 rounded-xl bg-mist p-1">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition sm:text-sm ${
                active ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <h2 className="mt-5 text-lg font-extrabold leading-snug text-ink sm:text-xl">
        Trouvez la pièce d&apos;occasion adaptée à votre véhicule
      </h2>

      {tab === "immat" && (
        <form action="/recherche" method="get" className="mt-4">
          <label htmlFor="immat" className="text-xs font-bold uppercase tracking-wide text-steel">
            Saisissez votre plaque d&apos;immatriculation
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 overflow-hidden rounded-lg border-2 border-ink">
              <span className="flex w-9 flex-col items-center justify-center bg-[#003399] text-[10px] font-bold text-white">
                <span className="text-sm leading-none">★</span>F
              </span>
              <input
                id="immat"
                name="immat"
                type="text"
                inputMode="text"
                autoComplete="off"
                placeholder="AB-123-CD"
                pattern="[A-Za-z]{2}[- ]?[0-9]{3}[- ]?[A-Za-z]{2}"
                title="Format attendu : AB-123-CD"
                className="w-full px-4 py-3 text-center text-xl font-extrabold uppercase tracking-[0.2em] text-ink outline-none placeholder:text-ink/30"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase text-ink-900 transition hover:bg-brand-600"
            >
              <SearchIcon size={18} />
              Rechercher
            </button>
          </div>
          <p className="mt-3 text-xs text-steel">
            Nous identifions votre véhicule pour n&apos;afficher que les pièces compatibles.
          </p>
        </form>
      )}

      {tab === "modele" && (
        <form action="/pieces-auto" method="get" className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="marque" className="text-xs font-bold uppercase tracking-wide text-steel">
              Marque
            </label>
            <select
              id="marque"
              name="marque"
              defaultValue=""
              className="mt-2 w-full rounded-lg border-2 border-line bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand"
            >
              <option value="">Toutes marques</option>
              {PLACEHOLDER_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="modele" className="text-xs font-bold uppercase tracking-wide text-steel">
              Modèle
            </label>
            <select
              id="modele"
              name="modele"
              defaultValue=""
              className="mt-2 w-full rounded-lg border-2 border-line bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand"
            >
              <option value="">Tous modèles</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase text-ink-900 transition hover:bg-brand-600"
          >
            <SearchIcon size={18} />
            Voir
          </button>
        </form>
      )}

      {tab === "reference" && (
        <form action="/recherche" method="get" className="mt-4">
          <label htmlFor="ref" className="text-xs font-bold uppercase tracking-wide text-steel">
            Référence constructeur ou équipementier
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="ref"
              name="ref"
              type="text"
              autoComplete="off"
              placeholder="Ex. 9661087680"
              className="w-full flex-1 rounded-lg border-2 border-line px-4 py-3 text-sm font-semibold outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase text-ink-900 transition hover:bg-brand-600"
            >
              <SearchIcon size={18} />
              Rechercher
            </button>
          </div>
          <p className="mt-3 text-xs text-steel">
            La référence est gravée sur la pièce d&apos;origine ou indiquée sur votre facture d&apos;entretien.
          </p>
        </form>
      )}
    </div>
  );
}
