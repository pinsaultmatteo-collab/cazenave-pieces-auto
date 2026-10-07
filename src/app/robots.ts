import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Robots d'outils SEO et d'entraînement d'IA : ils parcourent les 23 000 fiches
 * sans apporter de visiteurs, et chaque page lue consomme le transfert de
 * données de la base (quota Neon). Les moteurs de recherche et les assistants
 * de recherche IA (Google, Bing, ChatGPT Search, Perplexity…) restent autorisés.
 */
const BLOCKED_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "CCBot",
  "GPTBot",
  "ClaudeBot",
];

export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV === "production";
  return {
    rules: production
      ? [
          {
            userAgent: "*",
            allow: ["/", "/_next/image"],
            // Pas d'adresses avec paramètres (filtres, tri, pagination, recherche) : des milliers de
            // combinaisons sans contenu nouveau, déjà couvertes par les pages marques, modèles et fiches du plan du site.
            disallow: ["/api/", "/panier", "/commande", "/mon-compte", "/recherche", "/suivi-commande", "/*?"],
          },
          { userAgent: BLOCKED_BOTS, disallow: "/" },
        ]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
