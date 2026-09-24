import { photos } from "@/lib/photos";

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

export const PLACEHOLDER_CATEGORIES = [
  { name: "Carrosserie", slug: "carrosserie", photo: photos.cagesRed },
  { name: "Mécanique", slug: "mecanique", photo: photos.engines },
  { name: "Éclairage et signalisation", slug: "eclairage", photo: photos.aisleHeadlights },
  { name: "Habitacle", slug: "habitacle", photo: photos.seatStudio },
  { name: "Électrique et électronique", slug: "electrique", photo: photos.evBattery },
  { name: "Direction, suspension, train", slug: "direction-suspension", photo: photos.aisleWide },
  { name: "Freinage", slug: "freinage", photo: photos.racks },
  { name: "Refroidissement et climatisation", slug: "refroidissement-climatisation", photo: photos.aisle },
  { name: "Boîte de vitesses et transmission", slug: "transmission", photo: photos.aisleCages },
] as const;

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
