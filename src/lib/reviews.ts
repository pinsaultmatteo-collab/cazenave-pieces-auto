/**
 * Avis clients affichés sur l'accueil.
 *
 * ⚠️ Les avis ci-dessous sont des EXEMPLES de mise en page, à remplacer par
 * de vrais avis (export Google Business Profile, ou branchement de l'API
 * Google Places). Ne pas mettre en ligne tels quels.
 */
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  source: "Google";
};

export const SAMPLE_REVIEWS: Review[] = [
  {
    author: "Exemple · client particulier",
    rating: 5,
    date: "Septembre 2026",
    text: "Alternateur reçu en 48 h, bien emballé, conforme à la photo. Le SMS pour vérifier la compatibilité a été très utile.",
    source: "Google",
  },
  {
    author: "Exemple · garage partenaire",
    rating: 5,
    date: "Août 2026",
    text: "Interlocuteur unique, pièces disponibles au comptoir le jour même. On travaille avec eux depuis des années.",
    source: "Google",
  },
  {
    author: "Exemple · enlèvement de véhicule",
    rating: 5,
    date: "Juillet 2026",
    text: "Véhicule enlevé gratuitement en trois jours, démarches administratives faites par leurs soins. Simple et sérieux.",
    source: "Google",
  },
  {
    author: "Exemple · client particulier",
    rating: 4,
    date: "Juin 2026",
    text: "Bon rapport qualité-prix sur une porte d'occasion. Livraison un peu longue mais équipe réactive au téléphone.",
    source: "Google",
  },
];
