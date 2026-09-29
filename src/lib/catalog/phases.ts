/**
 * Phases d'un modèle et années de commercialisation : fonctions pures,
 * partagées par la base et la barre de filtres (composant client).
 */
type YearSpan = { from: number | null; to: number | null };

/** Vrai si la phase était commercialisée l'année donnée (`to` null : encore commercialisée). */
export function phaseCovers(p: YearSpan, year: number): boolean {
  return p.from !== null && year >= p.from && year <= (p.to ?? new Date().getFullYear());
}

/**
 * Phases correspondant à l'année d'un véhicule. Si aucune n'était
 * commercialisée cette année-là (données incomplètes), on retient la
 * dernière phase lancée avant.
 */
export function phasesForYear<T extends YearSpan>(phases: T[], year: number): T[] {
  const covered = phases.filter((p) => phaseCovers(p, year));
  if (covered.length) return covered;
  const before = phases.filter((p) => p.from !== null && p.from <= year);
  if (!before.length) return [];
  const latest = Math.max(...before.map((p) => p.from!));
  return before.filter((p) => p.from === latest);
}

/** Années couvertes par un ensemble de phases, de la plus récente à la plus ancienne. */
export function phaseYears(phases: YearSpan[]): number[] {
  const dated = phases.filter((p) => p.from !== null);
  if (!dated.length) return [];
  const now = new Date().getFullYear();
  const min = Math.min(...dated.map((p) => p.from!));
  const max = Math.min(now, Math.max(...dated.map((p) => p.to ?? now)));
  const years: number[] = [];
  for (let y = max; y >= min; y--) if (dated.some((p) => phaseCovers(p, y))) years.push(y);
  return years;
}

/** « 2016 – 2020 », « depuis 2019 » ou « 2008 ». */
export function phasePeriod(p: YearSpan): string {
  if (p.from === null) return "";
  if (p.to === null) return `depuis ${p.from}`;
  return p.from === p.to ? String(p.from) : `${p.from} – ${p.to}`;
}
