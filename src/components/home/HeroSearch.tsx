"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { normalizePlate } from "@/lib/plate-format";
import { modelHref } from "@/lib/catalog/links";

type Tab = "immat" | "modele" | "reference";
type Option = { slug: string; name: string; count?: number };

const tabs: { id: Tab; label: string }[] = [
  { id: "immat", label: "Immatriculation" },
  { id: "modele", label: "Marque et modèle" },
  { id: "reference", label: "Référence" },
];

/** Marques et modèles en stock, chargés à l'ouverture de l'onglet « Marque et modèle ». */
function useVehicleOptions(active: boolean, brand: string) {
  const [brands, setBrands] = useState<Option[] | null>(null);
  const [models, setModels] = useState<Record<string, Option[]>>({});

  useEffect(() => {
    if (!active || brands) return;
    let alive = true;
    fetch("/api/catalog/vehicles")
      .then((r) => r.json())
      .then((j: { brands?: Option[] }) => alive && setBrands(j.brands ?? []))
      .catch(() => alive && setBrands([]));
    return () => {
      alive = false;
    };
  }, [active, brands]);

  useEffect(() => {
    if (!brand || models[brand]) return;
    let alive = true;
    fetch(`/api/catalog/vehicles?marque=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((j: { models?: Option[] }) => alive && setModels((m) => ({ ...m, [brand]: j.models ?? [] })))
      .catch(() => alive && setModels((m) => ({ ...m, [brand]: [] })));
    return () => {
      alive = false;
    };
  }, [brand, models]);

  return { brands, models: brand ? models[brand] : undefined };
}

export function HeroSearch() {
  const [tab, setTab] = useState<Tab>("immat");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const { brands, models } = useVehicleOptions(tab === "modele", brand);
  const router = useRouter();
  const [plateError, setPlateError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();

  // Plaque : contrôle du format, puis page de résultats (identification côté serveur).
  const searchPlate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("immat") ?? "");
    const plate = normalizePlate(raw);
    if (!plate) {
      setPlateError("Format attendu : AB-123-CD (ou 123 ABC 31 pour les anciennes plaques).");
      return;
    }
    setPlateError(null);
    startSearch(() => router.push(`/recherche?immat=${encodeURIComponent(plate)}`));
  };

  // Catalogue filtré sur le véhicule, sans paramètres vides dans l'adresse.
  const searchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand && model) return router.push(`${modelHref(brand, model)}#recherche-resultats`);
    router.push(brand ? `/pieces-auto/marques/${brand}#recherche-resultats` : "/pieces-auto");
  };

  return (
    <div className="rounded-2xl border-t-4 border-brand bg-white p-5 shadow-2xl shadow-black/40 sm:p-7">
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
        <form action="/recherche" method="get" onSubmit={searchPlate} className="mt-4" noValidate>
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
                maxLength={12}
                aria-invalid={plateError ? true : undefined}
                aria-describedby={plateError ? "immat-error" : undefined}
                onChange={() => plateError && setPlateError(null)}
                className="w-full px-4 py-3 text-center text-xl font-extrabold uppercase tracking-[0.2em] text-ink outline-none placeholder:text-ink/30"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold uppercase text-ink-900 transition hover:bg-brand-600 disabled:opacity-70"
            >
              <SearchIcon size={18} />
              {searching ? "Identification…" : "Rechercher"}
            </button>
          </div>
          {plateError ? (
            <p id="immat-error" role="alert" className="mt-3 text-xs font-semibold text-red-600">
              {plateError}
            </p>
          ) : (
            <p className="mt-3 text-xs text-steel">Nous identifions votre véhicule pour n&apos;afficher que les pièces compatibles.</p>
          )}
        </form>
      )}

      {tab === "modele" && (
        <form action="/pieces-auto" method="get" onSubmit={searchVehicle} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="marque" className="text-xs font-bold uppercase tracking-wide text-steel">
              Marque
            </label>
            <select
              id="marque"
              name="marque"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
              }}
              disabled={!brands}
              className="mt-2 w-full rounded-lg border-2 border-line bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand disabled:bg-mist disabled:text-steel"
            >
              <option value="">{brands ? "Toutes marques" : "Chargement…"}</option>
              {brands?.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                  {b.count ? ` (${b.count})` : ""}
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
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!brand || !models?.length}
              className="mt-2 w-full rounded-lg border-2 border-line bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand disabled:bg-mist disabled:text-steel"
            >
              <option value="">{!brand ? "Choisissez une marque" : models ? "Tous modèles" : "Chargement…"}</option>
              {models?.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name}
                </option>
              ))}
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
