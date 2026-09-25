import type { NextConfig } from "next";

const OLD_MAG_TAGS = [
  "actualites", "avis", "conseils", "entreprise", "partenaire", "cazenavepiecesauto",
  "casse-auto-colomiers", "casse-auto-toulouse", "piece-detache-auto-colomiers",
  "piece-detache-auto-toulousepieces-auto", "pieces-detachees-auto-colomiers", "pieces-detachees-auto-toulouse",
  "pieces-detachees-citroen-toulouse", "pieces-detachees-ford-toulouse", "pieces-detachees-peugeot-toulouse",
  "pieces-detachees-renault-clio-toulouse", "pieces-detachees-renault-toulouse",
  "vente-de-boite-a-vitesse-doccasion-colomiers", "vente-de-moteur-occasion-colomiers",
  "vente-de-pieces-detachees-utilitaire-colomiers", "vente-de-pieces-detachees-utilitaires-toulouse",
  "vente-de-pneus-a-petits-prix-dcolomiers", "vente-de-turbo-a-petits-prix-sur-colomiers", "vente-pieces-detachees-auto",
  "pneus-doccasion-toulouse", "pieces-golf-pas-cher-toulouse",
];

const nextConfig: NextConfig = {
  // Postgres embarqué (développement) : binaire WASM chargé côté Node, pas bundlé
  serverExternalPackages: ["@electric-sql/pglite"],
  images: {
    remotePatterns: [
      // Photos des pièces et véhicules servies par le stockage Opisto
      { protocol: "https", hostname: "**.bso.st" },
      { protocol: "https", hostname: "**.opisto.fr" },
      { protocol: "https", hostname: "**.opisto.com" },
    ],
  },
  // Anciennes adresses du site cazenave.net : redirections définitives (référencement)
  async redirects() {
    return [
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/pieces-auto.php", destination: "/pieces-auto", permanent: true },
      { source: "/constructeurs-pieces-auto.php", destination: "/pieces-auto/marques", permanent: true },
      { source: "/pieces-auto-occasion/toutes-pieces/:brand", destination: "/pieces-auto/marques/:brand", permanent: true },
      { source: "/pieces-auto-occasion/:path*", destination: "/pieces-auto", permanent: true },
      { source: "/vehicules", destination: "/vehicules-occasion", permanent: true },
      { source: "/presentation.php", destination: "/qui-sommes-nous", permanent: true },
      { source: "/enlevement-voiture.php", destination: "/enlevement-vehicule", permanent: true },
      { source: "/contact.php", destination: "/contact", permanent: true },
      { source: "/conditions-generales-de-vente.php", destination: "/conditions-generales-de-vente", permanent: true },
      { source: "/mentions-legales.php", destination: "/mentions-legales", permanent: true },
      { source: "/mon-panier", destination: "/panier", permanent: true },
      { source: "/mon-panier/:path*", destination: "/panier", permanent: true },
      { source: "/mon-compte/:path+", destination: "/mon-compte", permanent: true },
      { source: "/article/:slug", destination: "/mag/:slug", permanent: true },
      // Anciennes pages de tags et catégories du Mag
      ...OLD_MAG_TAGS.map((tag) => ({ source: `/mag/${tag}`, destination: "/mag", permanent: true })),
    ];
  },
};

export default nextConfig;
