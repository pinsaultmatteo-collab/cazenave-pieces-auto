import { photos } from "@/lib/photos";
import coverGrosseMecanique from "@/assets/photos/categories/grosse-mecanique.webp";
import coverInterieure from "@/assets/photos/categories/carrosserie-interieure.jpg";
import coverExterieure from "@/assets/photos/categories/carrosserie-exterieure.jpg";

/**
 * Données provisoires affichées tant que la base locale n'est pas
 * alimentée par la synchronisation Opisto. À remplacer par des requêtes
 * en base dès que le connecteur est en place. Les photos, elles, sont
 * réelles (établissement de Colomiers).
 */

export const PLACEHOLDER_BRANDS = [
  "ALFA ROMEO", "AUDI", "BMW", "CITROEN", "DACIA", "DS", "FIAT", "FORD", "HONDA", "HYUNDAI",
  "JEEP", "KIA", "LAND ROVER", "MAZDA", "MERCEDES", "MINI", "MITSUBISHI", "NISSAN", "OPEL",
  "PEUGEOT", "PORSCHE", "RENAULT", "SEAT", "SKODA", "SMART", "SUZUKI", "TESLA", "TOYOTA",
  "VOLKSWAGEN", "VOLVO",
] as const;

/**
 * Visuels des catégories du catalogue : photo et pictogramme par adresse.
 * Les huit premières sont les familles Opisto ; les suivantes couvrent le
 * jeu de démonstration. Toute catégorie inconnue reçoit `CATEGORY_FALLBACK`.
 */
export const PLACEHOLDER_CATEGORIES = [
  { name: "Carrosserie extérieure", slug: "carrosserie-exterieure", photo: photos.cagesRed, icon: "carrosserie" },
  { name: "Carrosserie intérieure et divers", slug: "carrosserie-interieure-et-divers", photo: photos.seatStudio, icon: "habitacle" },
  { name: "Grosse mécanique", slug: "grosse-mecanique", photo: photos.engines, icon: "mecanique" },
  { name: "Petite mécanique", slug: "petite-mecanique", photo: photos.aisleWide, icon: "refroidissement-climatisation" },
  { name: "Electricité", slug: "electricite", photo: photos.evBattery, icon: "electrique" },
  { name: "Jantes", slug: "jantes", photo: photos.racks, icon: "direction-suspension" },
  { name: "Pneus", slug: "pneus", photo: photos.aisle, icon: "freinage" },
  { name: "Partie Cycle", slug: "partie-cycle", photo: photos.aisleCages, icon: "transmission" },
  { name: "Carrosserie", slug: "carrosserie", photo: photos.cagesRed, icon: "carrosserie" },
  { name: "Mécanique", slug: "mecanique", photo: photos.engines, icon: "mecanique" },
  { name: "Éclairage et signalisation", slug: "eclairage", photo: photos.aisleHeadlights, icon: "eclairage" },
  { name: "Habitacle", slug: "habitacle", photo: photos.seatStudio, icon: "habitacle" },
  { name: "Électrique et électronique", slug: "electrique", photo: photos.evBattery, icon: "electrique" },
  { name: "Direction, suspension, train", slug: "direction-suspension", photo: photos.aisleWide, icon: "direction-suspension" },
  { name: "Freinage", slug: "freinage", photo: photos.racks, icon: "freinage" },
  { name: "Refroidissement et climatisation", slug: "refroidissement-climatisation", photo: photos.aisle, icon: "refroidissement-climatisation" },
  { name: "Boîte de vitesses et transmission", slug: "transmission", photo: photos.aisleCages, icon: "transmission" },
] as const;

export const CATEGORY_FALLBACK = { photo: photos.aisle, icon: "mecanique" } as const;

/**
 * Couvertures imposées pour certaines familles sur l'accueil (choix de
 * Mattéo, sept. 2026). Les autres familles prennent une photo de pièce du
 * stock, puis la photo locale de repli.
 */
export const CATEGORY_COVERS: Record<string, (typeof photos)[keyof typeof photos]> = {
  "grosse-mecanique": coverGrosseMecanique,
  "carrosserie-interieure-et-divers": coverInterieure,
  "carrosserie-exterieure": coverExterieure,
};

/** Photo et pictogramme d'une catégorie, d'après son adresse. */
export function categoryVisual(slug: string): { photo: (typeof PLACEHOLDER_CATEGORIES)[number]["photo"]; icon: string } {
  return PLACEHOLDER_CATEGORIES.find((c) => c.slug === slug) ?? CATEGORY_FALLBACK;
}

export const PLACEHOLDER_ARTICLES = [
  {
    title: "96,98 % de taux de recyclage et valorisation",
    excerpt: "Comment notre centre VHU dépasse les objectifs européens de réemploi et de valorisation.",
    href: "/mag/9698-de-taux-de-recyclage-et-valorisation",
    photo: photos.parcRows,
  },
  {
    title: "Gestion du parc chez Cazenave Pièces Auto",
    excerpt: "De la réception du véhicule à la mise en rayon de la pièce : les coulisses du parc.",
    href: "/mag/gestion-du-parc-chez-cazenave-piece-auto",
    photo: photos.parcRows2,
  },
  {
    title: "Fonctionnement d'une expertise automobile",
    excerpt: "Ce qui se passe entre le sinistre, l'expert et l'arrivée du véhicule chez nous.",
    href: "/mag/cazenave-pieces-auto-toulouse-31-fonctionnement-dune-expertise",
    photo: photos.workshop,
  },
] as const;
