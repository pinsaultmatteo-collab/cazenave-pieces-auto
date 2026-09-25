import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getArticles } from "@/lib/mag";
import { getBrands, getCategories, getVehicles, partHref, searchParts, vehicleHref } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/pieces-auto`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/pieces-auto/marques`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/vehicules-occasion`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/enlevement-vehicule`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/qui-sommes-nous`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/espace-pro`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/mag`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/livraison-et-retours`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/garantie`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const [categories, brands, parts, vehicles] = await Promise.all([
    getCategories(),
    getBrands(),
    searchParts({ perPage: 48, page: 1 }),
    getVehicles({ perPage: 48 }),
  ]);

  return [
    ...statics,
    ...categories.map((c) => ({ url: `${base}/pieces-auto/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...brands.map((b) => ({ url: `${base}/pieces-auto/marques/${b.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...parts.items.map((p) => ({ url: `${base}${partHref(p)}`, lastModified: new Date(p.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...vehicles.items.map((v) => ({ url: `${base}${vehicleHref(v)}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...getArticles().map((a) => ({ url: `${base}/mag/${a.slug}`, lastModified: new Date(a.date), changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
