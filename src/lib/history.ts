import type { StaticImageData } from "next/image";
import { retro } from "@/lib/photos-retro";

export type Era = {
  year: string;
  title: string;
  text: string;
  photo: StaticImageData;
  alt: string;
};

/** Chronologie reprise de la page « Qui sommes-nous » du site actuel. */
export const HISTORY: Era[] = [
  {
    year: "1975",
    title: "Un mécanicien de Concorde monte sa casse",
    text: "Alain Cazenave, natif de Colomiers, a passé dix ans à l'Aérospatiale comme mécanicien aéronautique, puis mécanicien navigant sur le prototype Concorde et sur l'A300. En 1974, il quitte cet emploi stable pour créer « Cazenave & Cie » : un terrain de 4 000 m² dans la zone industrielle d'En-Jacca, un petit camion de remorquage, et des interventions sur les accidents jour et nuit, sept jours sur sept. Entre deux remorquages, il construit de ses mains ses premiers locaux de 600 m².",
    photo: retro.fondateur,
    alt: "Alain Cazenave, fondateur de l'entreprise",
  },
  {
    year: "1978",
    title: "Colomiers, Gimont et les pionniers du recyclage",
    text: "L'activité démarre dans les locaux neufs et un second magasin ouvre à Gimont, dans le Gers. Alain Cazenave rencontre neuf autres récupérateurs automobiles décidés à faire évoluer le métier : ils fondent avec Manuel Munoz le GIE « Contact 2000 », futur groupement INDRA. Leur première ambition : débarrasser la France des épaves disséminées dans les campagnes, quitte à couper à la tronçonneuse les arbres qui avaient poussé dedans.",
    photo: retro.carteGimont,
    alt: "Carte de visite Cazenave, Colomiers et Gimont",
  },
  {
    year: "1979",
    title: "Le 23 chemin de la Nasque",
    text: "Face au nombre croissant de véhicules et de clients, Alain acquiert le terrain situé en face de son premier magasin et y fait construire un bâtiment de 950 m² : magasin, bureaux et atelier de montage, sur 15 000 m² de parc de stockage. Il importe d'Italie des presses à ferrailles et compacte ses véhicules comme ceux des confrères alentour.",
    photo: retro.parcNasque,
    alt: "Vue aérienne du parc chemin de la Nasque",
  },
  {
    year: "1980",
    title: "Dany rejoint l'aventure",
    text: "Après huit ans dans l'aéronautique, aux ventes Concorde puis au service après-vente d'Airbus, Dany Cazenave structure les services administratifs de l'entreprise. Alain arrête les remorquages d'urgence pour se consacrer entièrement au développement de la filière de recyclage automobile.",
    photo: retro.carteVisite,
    alt: "Carte de visite Cazenave Pièces Auto",
  },
  {
    year: "1982",
    title: "Moteurs et boîtes de vitesses révisés",
    text: "Pour répondre à la demande, Alain monte des ateliers de rénovation de moteurs et de boîtes de vitesses et crée la société SIM : aléseuses de cylindres, rectifieuses de vilebrequins, épreuve et surfaçage des culasses. Deux ateliers de rectification ouvrent au sein des prisons de Muret et d'Eysses, et il rachète une usine de vilebrequins et de moteurs de 2CV à Cergy-Pontoise.",
    photo: retro.sim,
    alt: "En-tête de la Société d'Industries et de Matériels",
  },
  {
    year: "1983",
    title: "Les supermarchés de la pièce auto",
    text: "Alain et Dany inventent un concept : la casse auto devient un magasin propre où chacun trouve des pièces d'occasion, rénovées ou neuves en libre-service, vendues avec facture et montées sur place sans se salir. Présenté au Salon de la Franchise à Paris, le modèle séduit six candidats : Tarbes, Pau, Montauban, Béziers, Perpignan et Lézignan-Corbières. Huit magasins au total, avec Colomiers et Gimont.",
    photo: retro.sixMagasins,
    alt: "Publicité « Les supermarchés de la pièce auto »",
  },
  {
    year: "1985",
    title: "Naissance d'INDRA",
    text: "Le GIE Contact 2000 devient INDRA, Industrie Nationale de Recyclage Automobile. Cazenave Pièces Auto en est l'un des premiers adhérents, avec pour objectifs la promotion des pièces recyclées, l'organisation de la collecte des polluants et la protection de l'environnement. Alain revend les magasins franchisés et les ateliers pour se recentrer sur Colomiers.",
    photo: retro.t1985,
    alt: "Logo du réseau INDRA",
  },
  {
    year: "1994",
    title: "Balladurettes et Juppettes",
    text: "Les premières primes à la casse déversent des vagues inédites de véhicules à récupérer, réservées aux centres agréés par la préfecture, dont Cazenave est l'un des seuls sur la région toulousaine. Le parc déborde : Alain stocke provisoirement le surplus à la campagne pour laisser à ses équipes le temps de dépolluer chaque véhicule dans les règles.",
    photo: retro.parcAncien,
    alt: "Le parc de véhicules dans les années 1990",
  },
  {
    year: "1996",
    title: "Un an de travaux",
    text: "Pour marquer la différence entre le ferrailleur d'antan et le récupérateur moderne : un bâtiment en charpente métallique de 1 950 m² qui triple la surface de vente, des rayonnages sur toute la surface, un parc goudronné, un bassin de rétention étanche, un bâtiment dédié à la dépollution avec débourbeur-séparateur à hydrocarbures et citerne de stockage des fluides, une façade en bardage aluminium et une enseigne lumineuse.",
    photo: retro.renovationFacade,
    alt: "Dossier de rénovation de la façade",
  },
  {
    year: "1997",
    title: "« Nouvelles Normes »",
    text: "Dany accentue la communication : pages entières dans l'annuaire et les gratuits, spots à la radio locale et même au cinéma CGR de Blagnac, cartes plastifiées, t-shirts et stylos offerts. Le logo évolue et l'entreprise ne s'appelle plus une casse auto mais un centre de dépollution et de déconstruction automobile écologique « Nouvelles Normes ».",
    photo: retro.pubNouvellesNormes,
    alt: "Publicité « La pièce d'occasion Nouvelles Normes »",
  },
  {
    year: "1998",
    title: "Cazauto, le logiciel maison",
    text: "Aucun logiciel métier n'existe pour les épavistes. Dany rédige un cahier des charges et mandate un informaticien pour créer « Cazauto » : dossiers de véhicules, facturation, gestion du stock. Intuitif et taillé pour la profession, il séduit des confrères qui l'adoptent pour leur propre entreprise.",
    photo: retro.t1998,
    alt: "Le logiciel Cazauto",
  },
  {
    year: "1999",
    title: "Première casse à garantir ses pièces",
    text: "Avec son assureur Patrick Sacrispeyre, Alain conçoit un produit qui n'existe pas encore : une assurance spécifique aux pièces d'occasion. Cazenave devient la première casse auto de France à garantir ses pièces trois, six ou douze mois. L'assurance est ensuite diffusée à tout le réseau des récupérateurs.",
    photo: retro.t1999,
    alt: "Garantie des pièces d'occasion",
  },
  {
    year: "2000",
    title: "cazenave.net",
    text: "La digitalisation continue et l'entreprise s'ouvre au marché national : Dany lance la création du site web www.cazenave.net.",
    photo: retro.t2000,
    alt: "Premier site internet cazenave.net",
  },
  {
    year: "2001",
    title: "ISO 9001 et premier agrément VHU",
    text: "Dany rédige le dossier complet des procédures de l'entreprise : « on dit ce qu'on fait, et on fait ce qu'on dit ». Cazenave décroche la certification ISO 9001 auprès de Qualicert. La directive européenne sur les véhicules hors d'usage entre en application : l'entreprise obtient le premier agrément préfectoral accordé par la préfecture de Toulouse et devient centre agréé VHU.",
    photo: retro.t2001,
    alt: "Certification et agrément préfectoral",
  },
  {
    year: "2006",
    title: "Laurent reprend le flambeau",
    text: "Alain et Dany prennent leur retraite et transmettent l'entreprise familiale à leur fils Laurent, 26 ans, titulaire d'un CAP de mécanique et membre de l'équipe depuis plusieurs années. Il rénove l'espace de vente sur le modèle des concessions modernes, crée un site web professionnel et numérise l'intégralité du stock.",
    photo: retro.magasinJaune4,
    alt: "Le magasin rénové",
  },
  {
    year: "2010",
    title: "Opisto naît à Colomiers",
    text: "Deux étudiants toulousains, Laurent Assis Arentes et Johan Branca, imaginent une place de marché de pièces auto d'occasion. Laurent Cazenave soutient financièrement le projet : ainsi naît Opisto, devenu notre logiciel métier. Premier client, Cazenave met tout son savoir-faire à disposition pour l'optimiser avant sa diffusion commerciale.",
    photo: retro.t2010,
    alt: "Logo Opisto",
  },
  {
    year: "2013",
    title: "12 000 m² chemin de Naudinats",
    text: "Laurent saisit une opportunité immobilière : un bâtiment de 12 000 m² sur 42 000 m² de terrain, où il transfère l'entreprise. La logistique est repensée et le travail des techniciens facilité par du matériel de pointe, comme les retourneurs hydrauliques pour la dépollution. La Dépêche du Midi en fait un article.",
    photo: retro.articleDepeche,
    alt: "Article de La Dépêche du Midi",
  },
  {
    year: "2016",
    title: "Un directeur en gérance",
    text: "Désireux de se consacrer aux nouvelles technologies et à de nouveaux marchés dans l'automobile, Laurent nomme un de ses salariés au poste de directeur en gérance.",
    photo: retro.t2016,
    alt: "L'entreprise en 2016",
  },
  {
    year: "2021",
    title: "Retour au site historique, en vert",
    text: "Laurent reprend les rênes, restructure l'entreprise et vend le grand bâtiment du chemin de Naudinats en plusieurs lots. Cazenave Pièces Auto revient au 23 chemin de la Nasque. Le logo est décliné en vert, en symbiose avec les couleurs d'INDRA, pour affirmer un engagement environnemental de longue date. Mikaël Legrand, salarié depuis 2008, devient directeur général.",
    photo: retro.vert,
    alt: "La nouvelle identité verte",
  },
  {
    year: "2023",
    title: "Sophie Cazenave, directrice générale",
    text: "Deuxième génération à la tête de l'entreprise familiale, Sophie a exploré tous ses métiers dès son plus jeune âge, du stock à la comptabilité en passant par le comptoir. BTS de gestion, licence de droit, master en stratégie marketing digital, expériences dans l'assurance et la communication : depuis octobre 2023, elle dirige l'entreprise avec l'ambition de la moderniser. Elle a obtenu la certification Qualicert et concentre ses efforts sur la transformation digitale, la vente à distance, les processus internes et le taux de réemploi des pièces.",
    photo: retro.t2023,
    alt: "Sophie Cazenave, directrice générale",
  },
];
