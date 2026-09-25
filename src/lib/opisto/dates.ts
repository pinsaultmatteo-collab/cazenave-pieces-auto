/**
 * Dates de l'API Opisto.
 * - En entrée (filtres) : `dd-MM-yyyy-HH-mm-ss`, heure de Paris.
 * - En sortie : `DateTimeDto.UnixEpochTime` en millisecondes, ou la forme
 *   .NET `/Date(1712672957223+0200)/`.
 */

const PARIS = "Europe/Paris";

function parisParts(date: Date) {
  const f = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const map = Object.fromEntries(f.formatToParts(date).map((p) => [p.type, p.value]));
  return map as Record<"year" | "month" | "day" | "hour" | "minute" | "second", string>;
}

/** Format attendu par les filtres de /parts. */
export function toOpistoDate(date: Date): string {
  const p = parisParts(date);
  const hour = p.hour === "24" ? "00" : p.hour;
  return `${p.day}-${p.month}-${p.year}-${hour}-${p.minute}-${p.second}`;
}

/** Convertit une valeur de date Opisto en Date, ou null. */
export function fromOpistoDate(value: { UnixEpochTime?: number } | string | number | null | undefined): Date | null {
  if (value == null) return null;
  if (typeof value === "number") return new Date(value > 1e12 ? value : value * 1000);
  if (typeof value === "string") {
    const m = /\/Date\((-?\d+)/.exec(value);
    return m ? new Date(Number(m[1])) : null;
  }
  if (typeof value.UnixEpochTime === "number") return new Date(value.UnixEpochTime);
  return null;
}
