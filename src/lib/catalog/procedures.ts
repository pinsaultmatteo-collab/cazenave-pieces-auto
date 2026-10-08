/**
 * Procédure administrative d'un véhicule (Vehicle.VehicleProcedure dans
 * Opisto, champ « Procédure » de la fiche véhicule d'Opisto 360). Information
 * importante pour les professionnels qui achètent un véhicule d'occasion.
 */

/** Codes de l'énumération VehicleProcedure de l'API Opisto v2.15 (0 = non renseigné). */
const OPISTO_PROCEDURES: Record<number, string> = {
  1: "VEI-RSV",
  2: "VGA",
  3: "RIV",
  4: "VEI non VGE",
  5: "RIV-VGE",
  6: "VE",
  7: "VE-VEI",
  8: "VEI",
  9: "RIV-VE",
  10: "TNR",
  11: "SOCCO",
  12: "VGE",
  13: "RSV",
  14: "DS",
  15: "RSV-VGE",
  16: "VO",
  17: "VVR",
  18: "DS-VDP",
  19: "RIV-VE-DP",
  20: "DP",
  21: "RSV-VE",
};

/** Mêmes codes quand l'API les renvoie sous forme de texte (« VEIRSV », « VEINonVGE »…). */
const BY_NAME = Object.fromEntries(Object.values(OPISTO_PROCEDURES).map((code) => [code.replace(/[\s-]/g, "").toUpperCase(), code]));

/** Code lisible de la procédure, ou null si elle n'est pas renseignée. */
export function procedureCode(value: unknown): string | null {
  if (typeof value === "number") return OPISTO_PROCEDURES[value] ?? null;
  if (typeof value === "string" && value.trim()) {
    const v = value.trim();
    if (/^\d+$/.test(v)) return OPISTO_PROCEDURES[Number(v)] ?? null;
    if (/^undefine/i.test(v)) return null;
    return BY_NAME[v.replace(/[\s-]/g, "").toUpperCase()] ?? v;
  }
  return null;
}

/** Signification des principaux codes (affichée à côté du code). */
const MEANINGS: Record<string, string> = {
  VEI: "véhicule économiquement irréparable",
  VGE: "véhicule gravement endommagé",
  VE: "véhicule endommagé",
  RSV: "réparations supérieures à la valeur du véhicule",
};

/** « VEI (véhicule économiquement irréparable) », ou le code seul s'il n'a pas de libellé connu. */
export function procedureLabel(code: string): string {
  const meaning = MEANINGS[code];
  return meaning ? `${code} (${meaning})` : code;
}
