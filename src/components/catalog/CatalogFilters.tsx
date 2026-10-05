"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DoorOption, VehiclePhase } from "@/lib/catalog/types";
import { phasePeriod, phasesForYear, phaseYears } from "@/lib/catalog/phases";

export type FilterOption = { slug: string; name: string; count?: number };

type FilterValues = {
  category?: string;
  brand?: string;
  model?: string;
  year?: string;
  phase?: string;
  doors?: string;
  sort?: string;
  q?: string;
  ref?: string;
};

type CatalogFiltersProps = {
  basePath: string;
  categories?: FilterOption[];
  brands?: FilterOption[];
  modelsByBrand?: Record<string, FilterOption[]>;
  /** Phases en stock du modèle choisi, avec leurs années de commercialisation */
  phases?: VehiclePhase[];
  /** Nombres de portes disponibles : affiché seulement en carrosserie extérieure */
  doorOptions?: DoorOption[];
  values: FilterValues;
  /** Filtres figés par la page (catégorie ou marque de l'URL). */
  locked?: { category?: boolean; brand?: boolean; model?: boolean };
  total: number;
};

/** Noms des paramètres dans l'URL. */
const URL_KEYS: Record<keyof FilterValues, string> = {
  category: "categorie",
  brand: "marque",
  model: "modele",
  year: "annee",
  phase: "phase",
  doors: "portes",
  sort: "sort",
  q: "q",
  ref: "ref",
};

const selectClass =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-mist disabled:text-steel";
const labelClass = "block text-xs font-bold uppercase tracking-wide text-steel";

/**
 * Barre de filtres du catalogue : chaque changement met l'URL à jour.
 * Véhicule : marque, modèle, année puis phase (choisie automatiquement quand
 * une seule phase correspond à l'année). En carrosserie extérieure, un filtre
 * « portes » s'ajoute.
 */
export function CatalogFilters({ basePath, categories, brands, modelsByBrand, phases = [], doorOptions, values, locked, total }: CatalogFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(patch: Partial<FilterValues>) {
    const next: FilterValues = { ...values, ...patch };
    if ("brand" in patch) next.model = undefined;
    if ("brand" in patch || "model" in patch) {
      next.year = undefined;
      next.phase = undefined;
    }
    if ("category" in patch) next.doors = undefined;
    if ("year" in patch) {
      // Une seule phase commercialisée cette année-là : on la sélectionne.
      const matches = patch.year ? phasesForYear(phases, Number(patch.year)) : [];
      next.phase = matches.length === 1 ? matches[0].slug : undefined;
    }
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(next) as [keyof FilterValues, string | undefined][]) {
      // Filtres figés par la page : déjà dans l'adresse (/marques/renault/clio-3), inutile de les répéter
      if (!v || (k === "brand" && locked?.brand) || (k === "model" && locked?.model) || (k === "category" && locked?.category)) continue;
      sp.set(URL_KEYS[k], v);
    }
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false }));
  }

  const models = values.brand ? (modelsByBrand?.[values.brand] ?? []) : [];
  const hasModel = Boolean(values.model);
  const years = phaseYears(phases);
  const year = values.year ? Number(values.year) : undefined;
  // Toutes les phases restent proposées : l'année ne fait que présélectionner (ou restreindre les résultats).
  const yearPhases = year ? phasesForYear(phases, year) : [];
  const vehicleHint = !values.brand ? "Choisissez une marque" : "Choisissez un modèle";

  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
      onSubmit={(e) => e.preventDefault()}
      aria-busy={pending}
    >
      {brands && !locked?.brand && (
        <label className={labelClass}>
          Marque
          <select className={`mt-1.5 ${selectClass}`} value={values.brand ?? ""} onChange={(e) => update({ brand: e.target.value || undefined })}>
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
                {b.count !== undefined ? ` (${b.count})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {!locked?.model && (
        <label className={labelClass}>
          Modèle
          <select
            className={`mt-1.5 ${selectClass}`}
            value={values.model ?? ""}
            disabled={!values.brand || models.length === 0}
            onChange={(e) => update({ model: e.target.value || undefined })}
          >
            <option value="">{values.brand ? "Tous les modèles" : "Choisissez une marque"}</option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className={labelClass}>
        Année du véhicule
        <select
          className={`mt-1.5 ${selectClass}`}
          value={values.year ?? ""}
          disabled={!hasModel || years.length === 0}
          onChange={(e) => update({ year: e.target.value || undefined })}
        >
          <option value="">{hasModel ? "Toutes les années" : vehicleHint}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Phase
        <select
          className={`mt-1.5 ${selectClass}`}
          value={values.phase ?? ""}
          disabled={!hasModel || phases.length === 0}
          onChange={(e) => update({ phase: e.target.value || undefined })}
        >
          <option value="">
            {!hasModel ? vehicleHint : year ? `Phases de ${year}${yearPhases.length > 1 ? ` (${yearPhases.length})` : ""}` : "Toutes les phases"}
          </option>
          {phases.map((p) => {
            const period = phasePeriod(p);
            return (
              <option key={p.slug} value={p.slug}>
                {p.label}
                {period ? ` (${period})` : ""}
              </option>
            );
          })}
        </select>
      </label>
      {categories && !locked?.category && (
        <label className={labelClass}>
          Catégorie
          <select className={`mt-1.5 ${selectClass}`} value={values.category ?? ""} onChange={(e) => update({ category: e.target.value || undefined })}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {c.count !== undefined ? ` (${c.count})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {doorOptions && (doorOptions.length > 0 || values.doors) && (
        <label className={labelClass}>
          Nombre de portes
          <select
            className={`mt-1.5 ${selectClass}`}
            value={values.doors ?? ""}
            onChange={(e) => update({ doors: e.target.value || undefined })}
          >
            <option value="">Toutes</option>
            {doorOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.value} portes ({d.count})
              </option>
            ))}
            {values.doors && !doorOptions.some((d) => String(d.value) === values.doors) && <option value={values.doors}>{values.doors} portes (0)</option>}
          </select>
        </label>
      )}
      <label className={labelClass}>
        Trier par
        <select className={`mt-1.5 ${selectClass}`} value={values.sort ?? "recent"} onChange={(e) => update({ sort: e.target.value === "recent" ? undefined : e.target.value })}>
          <option value="recent">Nouveautés</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </label>
      <p className="text-sm font-semibold text-ink lg:pb-2.5" aria-live="polite">
        {pending ? "Recherche…" : `${total.toLocaleString("fr-FR")} pièce${total > 1 ? "s" : ""}`}
      </p>
    </form>
  );
}
