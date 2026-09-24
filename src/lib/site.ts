import logoIndra from "@/assets/brand/logo-indra.png";
import logoVhu from "@/assets/brand/logo-vhu.png";
import logoAdeme from "@/assets/brand/logo-ademe.png";
import logoQualicert from "@/assets/brand/logo-qualicert.png";
import logoGoodbyeCar from "@/assets/brand/goodbyecar.png";
import pictoHoraire from "@/assets/brand/picto-horaire.svg";
import pictoGarantie from "@/assets/brand/picto-garantie.svg";
import pictoMadeInFrance from "@/assets/brand/picto-made-in-france.svg";
import pictoCamion from "@/assets/brand/picto-camion.svg";
import pictoSecurite from "@/assets/brand/picto-securite.svg";
import pictoSupport from "@/assets/brand/picto-support-client.svg";

/**
 * Informations de l'entreprise et configuration globale du site.
 * Source : site actuel cazenave.net (septembre 2026).
 */
export const site = {
  name: "Cazenave Pièces Auto",
  shortName: "Cazenave",
  legalName: "Cazenave Pièces Auto SAS",
  tagline: "Le spécialiste de la pièce auto d'occasion depuis 1974",
  description:
    "Trouvez simplement et rapidement votre pièce auto d'occasion pas cher, testée et garantie 12 mois. Expédition sous 24/48h partout en France depuis notre casse auto de Colomiers, près de Toulouse.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cazenave.net",
  foundedYear: 1974,

  phone: "05 61 78 40 40",
  phoneHref: "tel:+33561784040",
  sms: "09 39 37 80 06",
  smsHref: "sms:+33939378006",
  whatsapp: "https://wa.me/message/F5LM4YC3F3RXH1",

  address: {
    street: "23 chemin de la Nasque",
    extra: "ZI en Jacca",
    postcode: "31770",
    city: "Colomiers",
    country: "France",
  },
  hours: "Du lundi au vendredi, 9h – 17h",
  hoursShort: "Lun. – ven. 9h – 17h",
  hoursClosed: "Fermé le samedi et le dimanche",

  agrement: "31.00043.D",

  social: {
    facebook: "https://www.facebook.com/CazenavePiecesAuto/",
    instagram: "https://instagram.com/cazenavepiecesauto",
    linkedin: "https://www.linkedin.com/company/cazenave-pieces-auto/",
    googleReviews:
      "https://www.google.com/search?q=cazenave+casse+auto#lrd=0x12aeb1a4fb6e306d:0x53da8547a99b3ad9,1",
  },

  nav: [
    { label: "Pièces auto", href: "/pieces-auto" },
    { label: "Véhicules d'occasion", href: "/vehicules-occasion" },
    { label: "Enlèvement de véhicule", href: "/enlevement-vehicule" },
    { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
    { label: "Le Mag", href: "/mag" },
    { label: "Contact", href: "/contact" },
  ],

  /** Bandeau de réassurance (pictos du site actuel). */
  reassurance: [
    { title: "Expédition rapide", text: "Commande expédiée sous 24/48h", icon: pictoHoraire },
    { title: "Garantie 12 mois", text: "Sur toutes nos pièces d'occasion", icon: pictoGarantie },
    { title: "Made in France", text: "Pièces démontées et testées à Colomiers", icon: pictoMadeInFrance },
    { title: "Livraison", text: "Partout en France ou retrait sur place", icon: pictoCamion },
    { title: "Paiement sécurisé", text: "Carte bancaire et PayPal", icon: pictoSecurite },
    { title: "Support client", text: "Lun. – ven. 9h – 17h, par téléphone ou SMS", icon: pictoSupport },
  ],

  /**
   * Logos partenaires et certifications : obligation contractuelle de les
   * conserver en pied de page avec leurs liens cliquables.
   */
  partners: [
    { name: "Indra, réseau de recyclage automobile", logo: logoIndra, href: "https://www.indra.fr/fr/home" },
    { name: "Centre VHU agréé par la préfecture de Haute-Garonne", logo: logoVhu, href: "/qui-sommes-nous#agrement" },
    { name: "ADEME", logo: logoAdeme, href: "https://www.ademe.fr" },
    { name: "Certification Qualicert", logo: logoQualicert, href: "https://www.qualicert.fr" },
    { name: "GoodbyeCar", logo: logoGoodbyeCar, href: "https://www.goodbye-car.com" },
  ],

  /** Partenaires cités en texte sur le site actuel. */
  textPartners: [
    { name: "Derichebourg", href: "https://www.derichebourg.com/fr/accueil" },
    { name: "Chimirec", href: "https://chimirec.fr/" },
    { name: "Soregom", href: "http://www.soregom.com/" },
    { name: "Garage pour tous", href: "https://garagepourtous.fr/" },
  ],
} as const;

export type NavItem = (typeof site.nav)[number];
