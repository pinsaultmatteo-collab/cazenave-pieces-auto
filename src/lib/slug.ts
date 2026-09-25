/** Transforme un libellé en segment d'URL : « Boîte de vitesses » → « boite-de-vitesses ». */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extrait l'identifiant numérique en tête d'un segment « 1234-alternateur-clio ». */
export function idFromSlug(segment: string): number | null {
  const m = /^(\d+)(?:-|$)/.exec(segment);
  return m ? Number(m[1]) : null;
}
