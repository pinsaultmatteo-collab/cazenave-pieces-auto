/**
 * Données provisoires affichées tant que la base locale n'est pas
 * alimentée par la synchronisation Opisto. À remplacer par des requêtes
 * en base dès que le connecteur est en place.
 */

export const PLACEHOLDER_BRANDS = [
  "ALFA ROMEO", "AUDI", "BMW", "CITROEN", "DACIA", "DS", "FIAT", "FORD", "HONDA", "HYUNDAI",
  "JEEP", "KIA", "LAND ROVER", "MAZDA", "MERCEDES", "MINI", "MITSUBISHI", "NISSAN", "OPEL",
  "PEUGEOT", "PORSCHE", "RENAULT", "SEAT", "SKODA", "SMART", "SUZUKI", "TESLA", "TOYOTA",
  "VOLKSWAGEN", "VOLVO",
] as const;

export const PLACEHOLDER_CATEGORIES = [
  { name: "Carrosserie", slug: "carrosserie" },
  { name: "Mécanique", slug: "mecanique" },
  { name: "Éclairage et signalisation", slug: "eclairage" },
  { name: "Habitacle", slug: "habitacle" },
  { name: "Électrique et électronique", slug: "electrique" },
  { name: "Direction, suspension, train", slug: "direction-suspension" },
  { name: "Freinage", slug: "freinage" },
  { name: "Refroidissement et climatisation", slug: "refroidissement-climatisation" },
  { name: "Boîte de vitesses et transmission", slug: "transmission" },
] as const;

export const PLACEHOLDER_ARTICLES = [
  {
    title: "96,98 % de taux de recyclage et valorisation",
    excerpt: "Comment notre centre VHU dépasse les objectifs européens de réemploi et de valorisation.",
    href: "/mag/9698-de-taux-de-recyclage-et-valorisation",
  },
  {
    title: "Gestion du parc chez Cazenave Pièces Auto",
    excerpt: "De la réception du véhicule à la mise en rayon de la pièce : les coulisses du parc.",
    href: "/mag/gestion-du-parc-chez-cazenave-piece-auto",
  },
  {
    title: "Fonctionnement d'une expertise automobile",
    excerpt: "Ce qui se passe entre le sinistre, l'expert et l'arrivée du véhicule chez nous.",
    href: "/mag/cazenave-pieces-auto-toulouse-31-fonctionnement-dune-expertise",
  },
] as const;
