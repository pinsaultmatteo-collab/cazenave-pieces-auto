import articles from "@/content/mag.json";

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
