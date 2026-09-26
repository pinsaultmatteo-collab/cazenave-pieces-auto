import articles from "@/content/mag.json";
import { slugify } from "@/lib/slug";

export type Article = {
  slug: string;
  title: string;
  /** ISO 8601 */
  date: string;
  category: string;
  tags: string[];
  cover: string | null;
  excerpt: string;
  description: string;
  html: string;
};

const ALL = (articles as Article[]).slice().sort((a, b) => b.date.localeCompare(a.date));

export function getArticles(): Article[] {
  return ALL;
}

export function getArticle(slug: string): Article | null {
  return ALL.find((a) => a.slug === slug) ?? null;
}

export function getLatestArticles(limit = 3): Article[] {
  return ALL.slice(0, limit);
}

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };

/** Ajoute un identifiant d'ancre à chaque intertitre et renvoie la liste pour le sommaire. */
export function articleSections(html: string): { html: string; headings: ArticleHeading[] } {
  const headings: ArticleHeading[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    let id = slugify(text) || "section";
    while (used.has(id)) id = `${id}-${used.size}`;
    used.add(id);
    headings.push({ id, text, level: Number(lvl) as 2 | 3 });
    const cleanAttrs = attrs.replace(/\sid="[^"]*"/i, "");
    return `<h${lvl}${cleanAttrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, headings };
}

/** Temps de lecture estimé, en minutes (200 mots par minute, minimum 1). */
export function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
