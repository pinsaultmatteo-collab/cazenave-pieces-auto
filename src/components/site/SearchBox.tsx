"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { ChevronRightIcon, SearchIcon } from "@/components/icons";

type PartHit = { id: number; href: string; name: string; vehicle: string; reference: string | null; price: number; photo: string | null };
type NameHit = { name: string; href: string };
type Results = { q: string; total: number; parts: PartHit[]; brands: NameHit[]; models: NameHit[]; categories: NameHit[] };

const EMPTY: Results = { q: "", total: 0, parts: [], brands: [], models: [], categories: [] };
const MIN = 2;

/** Met en gras la partie du libellé qui correspond à la saisie. */
function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

type Props = {
  id: string;
  /** Résultats affichés dans le flux (menu mobile) plutôt qu'en panneau flottant */
  inline?: boolean;
  className?: string;
  placeholder?: string;
};

/**
 * Barre de recherche avec propositions instantanées : pièces (photo,
 * véhicule, prix), marques et catégories, dès deux caractères saisis.
 * La touche Entrée sans sélection ouvre la page de résultats complète.
 */
export function SearchBox({ id, inline = false, className = "", placeholder = "Rechercher une pièce, une référence constructeur…" }: Props) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = q.trim();
  const items = useMemo(() => {
    const list: { key: string; href: string }[] = [];
    results.parts.forEach((p) => list.push({ key: `p${p.id}`, href: p.href }));
    results.brands.forEach((b) => list.push({ key: `b${b.href}`, href: b.href }));
    results.models.forEach((m) => list.push({ key: `m${m.href}`, href: m.href }));
    results.categories.forEach((c) => list.push({ key: `c${c.href}`, href: c.href }));
    if (results.total > 0) list.push({ key: "all", href: `/recherche?q=${encodeURIComponent(results.q)}` });
    return list;
  }, [results]);

  // Interrogation avec temporisation et annulation de la requête précédente
  useEffect(() => {
    if (term.length < MIN) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Results;
        if (!controller.signal.aborted) {
          setResults(data);
          setActive(-1);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) setResults({ ...EMPTY, q: term });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  // Fermeture au clic en dehors
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(items[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && term.length >= MIN;
  const hasResults = results.parts.length + results.brands.length + results.models.length + results.categories.length > 0;
  const activeKey = active >= 0 ? items[active]?.key : null;
  const rowClass = (key: string, extra = "") =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${activeKey === key ? "bg-brand-50" : "hover:bg-mist"} ${extra}`;

  const panel = showPanel && (
    <div
      id={listId}
      role="listbox"
      aria-label="Propositions"
      className={
        inline
          ? "mt-3 rounded-2xl border border-line bg-white"
          : "absolute inset-x-0 top-full z-50 mt-2 max-h-[min(70vh,640px)] overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl shadow-ink/15"
      }
    >
      {loading && !hasResults ? (
        <p className="px-4 py-4 text-sm text-steel">Recherche en cours…</p>
      ) : !hasResults ? (
        <div className="px-4 py-4 text-sm text-steel">
          Aucune pièce ne correspond à « {results.q || term} ».
          <span className="mt-1 block text-xs">Essayez un autre mot, une référence constructeur ou votre immatriculation.</span>
        </div>
      ) : (
        <div className="p-2">
          {results.parts.length > 0 && (
            <section>
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-steel">Pièces</p>
              <ul>
                {results.parts.map((p) => (
                  <li key={p.id} role="option" aria-selected={activeKey === `p${p.id}`}>
                    <Link href={p.href} onClick={() => setOpen(false)} className={rowClass(`p${p.id}`)}>
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-mist">
                        {p.photo ? (
                          <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-steel">Photo à venir</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          <Highlight text={p.name} q={term} />
                        </span>
                        <span className="block truncate text-xs text-steel">
                          {p.vehicle}
                          {p.reference ? ` · Réf. ${p.reference}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 font-display text-lg font-semibold text-ink">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(results.brands.length > 0 || results.models.length > 0 || results.categories.length > 0) && (
            <section className="mt-1 border-t border-line pt-1">
              <ul className="flex flex-wrap gap-1 px-1 py-2">
                {[
                  ...results.brands.map((b) => ({ ...b, key: `b${b.href}`, kind: "Marque" })),
                  ...results.models.map((m) => ({ ...m, key: `m${m.href}`, kind: "Modèle" })),
                  ...results.categories.map((c) => ({ ...c, key: `c${c.href}`, kind: "Catégorie" })),
                ].map((hit) => (
                  <li key={hit.key} role="option" aria-selected={activeKey === hit.key}>
                    <Link
                      href={hit.href}
                      onClick={() => setOpen(false)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        activeKey === hit.key ? "border-brand bg-brand-50 text-ink" : "border-line text-ink hover:border-brand"
                      }`}
                    >
                      <span className="text-steel">{hit.kind} ·</span> <Highlight text={hit.name} q={term} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.total > 0 && (
            <Link
              href={`/recherche?q=${encodeURIComponent(results.q)}`}
              onClick={() => setOpen(false)}
              role="option"
              aria-selected={activeKey === "all"}
              className={rowClass("all", "mt-1 justify-between border-t border-line pt-3 text-sm font-bold text-brand-700")}
            >
              Voir {results.total.toLocaleString("fr-FR")} résultat{results.total > 1 ? "s" : ""} pour « {results.q} »
              <ChevronRightIcon size={16} />
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <form
      ref={rootRef}
      action="/recherche"
      method="get"
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        if (term.length === 0) e.preventDefault();
        setOpen(false);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Rechercher une pièce
      </label>
      <div className="flex w-full overflow-hidden rounded-full border border-line bg-mist transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
        <input
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          autoComplete="off"
          value={q}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);
            setOpen(true);
            if (value.trim().length < MIN) {
              abortRef.current?.abort();
              setResults(EMPTY);
              setLoading(false);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showPanel ? true : false}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-steel"
        />
        <button type="submit" className="flex items-center bg-ink px-5 text-white transition hover:bg-ink-700" aria-label="Rechercher">
          <SearchIcon />
        </button>
      </div>
      {panel}
    </form>
  );
}
