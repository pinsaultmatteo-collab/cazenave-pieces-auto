"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export type FilterOption = { slug: string; name: string; count?: number };

type CatalogFiltersProps = {
  basePath: string;
  categories?: FilterOption[];
  brands?: FilterOption[];
  modelsByBrand?: Record<string, FilterOption[]>;
  values: { category?: string; brand?: string; model?: string; sort?: string; q?: string; ref?: string };
  /** Filtres figés par la page (catégorie ou marque de l'URL). */
  locked?: { category?: boolean; brand?: boolean };
  total: number;
};

const selectClass =
  "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:bg-mist disabled:text-steel";

/** Barre de filtres du catalogue : chaque changement met l'URL à jour. */
export function CatalogFilters({ basePath, categories, brands, modelsByBrand, values, locked, total }: CatalogFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function update(patch: Record<string, string | undefined>) {
    const next = { ...values, ...patch };
    if (patch.brand !== undefined) next.model = undefined;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false }));
  }

  const models = values.brand ? (modelsByBrand?.[values.brand] ?? []) : [];

  return (
    <form
      className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end"
      onSubmit={(e) => e.preventDefault()}
      aria-busy={pending}
    >
      {categories && !locked?.category && (
        <label className="block text-xs font-bold uppercase tracking-wide text-steel">
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
      {brands && !locked?.brand && (
        <label className="block text-xs font-bold uppercase tracking-wide text-steel">
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
      <label className="block text-xs font-bold uppercase tracking-wide text-steel">
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
      <label className="block text-xs font-bold uppercase tracking-wide text-steel">
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
