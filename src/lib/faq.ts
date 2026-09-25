/**
 * Questions fréquentes de l'accueil. Réponses reprises des pages du site
 * actuel (enlèvement de véhicule, conditions générales de vente).
 */
export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: FaqItem[] };

export const FAQ: FaqGroup[] = [
  {
    title: "Enlèvement de véhicule",
    items: [
      {
        question: "L'enlèvement de mon véhicule est-il vraiment gratuit ?",
        answer:
          "Oui, sous conditions. En tant que centre VHU agréé par la préfecture de Haute-Garonne, nous recyclons votre véhicule hors d'usage gratuitement et nous nous occupons de toutes les démarches administratives à votre place. Nous intervenons en régions Occitanie et Nouvelle-Aquitaine : contactez notre service enlèvement pour vérifier votre éligibilité.",
      },
      {
        question: "Mon véhicule ne roule plus, comment ça se passe ?",
        answer:
          "Nous planifions gratuitement le remorquage de votre épave, puis nous procédons à sa dépollution et à son recyclage dans notre centre agréé de Colomiers. Si votre véhicule roule encore, vous pouvez aussi nous l'amener directement pour une reprise immédiate.",
      },
      {
        question: "Quels documents dois-je fournir pour la reprise ?",
        answer:
          "La carte grise originale du véhicule, le certificat de cession et une pièce d'identité du propriétaire. Nous vous remettons ensuite les justificatifs de destruction nécessaires à la résiliation de votre assurance.",
      },
      {
        question: "Pouvez-vous faire ma carte grise ?",
        answer:
          "Oui. Nous sommes habilités par le ministère de l'Intérieur pour réaliser les démarches d'immatriculation sur le SIV. Nous délivrons un certificat d'immatriculation provisoire valable un mois en attendant votre carte grise définitive. Prévoyez la carte grise originale, le certificat de cession, une pièce d'identité, un justificatif de domicile de moins de trois mois, le permis de conduire, l'attestation d'assurance et le contrôle technique.",
      },
    ],
  },
  {
    title: "Achat de pièces en ligne",
    items: [
      {
        question: "Comment être sûr qu'une pièce est compatible avec mon véhicule ?",
        answer:
          "Recherchez par plaque d'immatriculation ou par marque et modèle : nous n'affichons que les pièces montées sur des véhicules compatibles. Chaque pièce est rattachée à son véhicule d'origine et à sa référence constructeur. En cas de doute, envoyez-nous un SMS au 09 39 37 80 06 avec votre immatriculation avant de commander.",
      },
      {
        question: "Les pièces d'occasion sont-elles garanties ?",
        answer:
          "Oui. Toutes nos pièces bénéficient d'une garantie commerciale de 12 mois, en plus des garanties légales de conformité et des vices cachés. La garantie couvre la pièce, hors main-d'œuvre de montage.",
      },
      {
        question: "Quels sont les délais et les modes de livraison ?",
        answer:
          "Votre commande est expédiée sous 24 à 48 heures ouvrées. Nous livrons partout en France, dans l'Union européenne et à l'export. Vous pouvez aussi retirer votre pièce gratuitement au comptoir de Colomiers, du lundi au vendredi de 9h à 17h.",
      },
      {
        question: "Puis-je retourner une pièce achetée en ligne ?",
        answer:
          "Oui. Vous disposez de 15 jours calendaires à compter de la réception pour exercer votre droit de rétractation, puis de 14 jours pour nous renvoyer la pièce dans son état d'origine. Le remboursement intervient sous 14 jours après réception. Les pièces achetées au comptoir ne sont ni reprises ni échangées, sauf défaillance avérée couverte par la garantie.",
      },
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer:
          "Carte bancaire via un paiement sécurisé, et PayPal. Votre commande est confirmée par e-mail sous 24 heures après l'encaissement du paiement.",
      },
    ],
  },
];
