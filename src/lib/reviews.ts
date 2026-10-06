/**
 * Avis clients affichés sur l'accueil : vrais avis de la fiche Google
 * Business Profile de Cazenave, recopiés tels quels (relevé du 6 octobre
 * 2026). Nom réduit au prénom et à l'initiale du nom.
 */
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  source: "Google";
};

export const REVIEWS: Review[] = [
  {
    author: "Patrick R.",
    rating: 5,
    date: "Octobre 2026",
    text: "Commande conforme à ce qui était annoncé. Livraison très rapide et renseignements sur le côté confirmé par téléphone. Service parfait.",
    source: "Google",
  },
  {
    author: "Hannibal S.",
    rating: 5,
    date: "Septembre 2026",
    text: "Parfait. Rapide, efficace et tres bonne communication",
    source: "Google",
  },
  {
    author: "Boulkroune J.",
    rating: 5,
    date: "Septembre 2026",
    text: "Pièce propre livraison rapide sur palette devant la Maison. Nickel",
    source: "Google",
  },
  {
    author: "Christelle C.",
    rating: 5,
    date: "Septembre 2026",
    text: "La pièce que j' ai commandé correspondait complètement et le délai de livraison a même avancé ! Super je recommande cette entreprise !",
    source: "Google",
  },
  {
    author: "Hrantmj A.",
    rating: 5,
    date: "Septembre 2026",
    text: "Reçu très vite comme d'habitude, pièce presque neuve ça mérite les 5 étoiles merci beaucoup, ça fait des années que j'achète au même endroit 🤩✌️",
    source: "Google",
  },
  {
    author: "Samuel L.",
    rating: 5,
    date: "Septembre 2026",
    text: "Commande traitée sans délai et colis reçu en parfait état. Reste à vérifier la compatibilité lors du montage prévu prochainement.",
    source: "Google",
  },
  {
    author: "Babela K.",
    rating: 5,
    date: "Septembre 2026",
    text: "Échange par SMS rapide et efficace. Professionnalisme indéniable",
    source: "Google",
  },
];
