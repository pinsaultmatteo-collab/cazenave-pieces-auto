import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Timeline } from "@/components/about/Timeline";
import { ContactForm } from "@/components/forms/ContactForm";
import { Counter } from "@/components/motion/Counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HISTORY } from "@/lib/history";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Qui sommes-nous : une casse auto familiale depuis 1974",
  description:
    "L'histoire de Cazenave Pièces Auto, centre VHU agréé à Colomiers depuis 1974 : d'un mécanicien de Concorde à la deuxième génération, cinquante ans de recyclage automobile près de Toulouse.",
  alternates: { canonical: "/qui-sommes-nous" },
};

const FIGURES = [
  { to: 1974, label: "année de création par Alain Cazenave", format: false },
  { to: 2, suffix: "e", label: "génération à la tête de l'entreprise familiale" },
  { to: 95, suffix: " %", label: "de réutilisation et de valorisation de chaque véhicule" },
  { to: 12, suffix: " mois", label: "de garantie, une exigence depuis 1999" },
];

const VALUES = [
  { title: "L'esprit d'équipe", kicker: "Notre ADN", text: "Notre succès est le fruit du travail collaboratif : entraide, partage des connaissances et soutien mutuel, pour que chacun s'épanouisse dans son rôle." },
  { title: "La motivation", kicker: "Notre moteur", text: "Peu importe votre parcours : si vous avez la passion de l'automobile et l'esprit d'initiative, nous investissons dans votre formation pour grandir ensemble." },
  { title: "Construire ensemble", kicker: "Notre vision", text: "Nous ne recrutons pas des employés, nous bâtissons une communauté. Novice passionné ou professionnel aguerri, votre contribution compte." },
];

const COMMITMENTS = [
  {
    title: "La formation des pompiers de Haute-Garonne",
    text: "Nous fournissons des véhicules hors d'usage aux casernes de Colomiers, Muret, Carbonne et Aussonne pour leurs entraînements à la désincarcération des blessés de la route.",
    photo: photos.firefighters,
    alt: "Pompiers en formation sur le parc",
  },
  {
    title: "La formation des professionnels de demain",
    text: "Nous prêtons des véhicules au lycée Joseph Gallieni de Toulouse, qui forme des bacs pro mécanique, et nous recrutons ses élèves en alternance pour leur transmettre notre savoir-faire.",
    photo: photos.lift,
    alt: "Véhicule sur pont élévateur dans l'atelier",
  },
  {
    title: "La prévention routière",
    text: "Directement confrontés aux dangers de la route à travers les véhicules accidentés que nous récupérons pour les assureurs, nous mettons des véhicules à disposition des actions de prévention.",
    photo: photos.crane,
    alt: "Véhicule accidenté manipulé par la grue",
  },
  {
    title: "La lutte contre l'exclusion sociale",
    text: "Nous fournissons gratuitement des pièces d'occasion à Garage pour tous, un garage associatif qui aide les personnes à faibles ressources à entretenir leur véhicule.",
    photo: photos.counter,
    alt: "Comptoir d'accueil du magasin",
  },
];

const PARTNERS = [
  { name: "Derichebourg", href: "https://www.derichebourg.com/fr/accueil", text: "Collecte et recyclage des métaux : carrosseries, moteurs, trains, radiateurs et batteries, triés dans notre centre avant enlèvement." },
  { name: "Chimirec", href: "https://chimirec.fr/", text: "Collecte et traitement des fluides polluants : huiles moteur, liquides de refroidissement, de frein et de lave-glace, recueillis séparément lors de la dépollution." },
  { name: "Soregom", href: "http://www.soregom.com/", text: "Collecte et valorisation des pneus, transformés en matériaux de travaux publics ou en combustible de substitution pour les cimenteries." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Qui sommes-nous"
        title={
          <>
            Une casse auto familiale <span className="text-brand-400">depuis 1974</span>
          </>
        }
        text="Valoriser la matière pour donner une seconde vie aux pièces d'occasion. D'un mécanicien de Concorde à la deuxième génération, cinquante ans d'histoire à Colomiers."
        image={photos.heroBuilding}
        imageAlt="Vue aérienne du centre Cazenave Pièces Auto"
        crumbs={[{ label: "Qui sommes-nous" }]}
      />

      {/* Chiffres */}
      <section className="border-b border-line bg-white">
        <Stagger className="container-x grid grid-cols-2 gap-6 py-10 lg:grid-cols-4" stagger={0.1}>
          {FIGURES.map((f) => (
            <StaggerItem key={f.label}>
              <p className="display-title text-4xl text-brand-700 sm:text-5xl">
                {f.format === false ? f.to : <Counter to={f.to} suffix={f.suffix} />}
              </p>
              <p className="mt-2 text-sm leading-5 text-steel">{f.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Histoire */}
      <section className="bg-mist">
        <div className="container-x py-16 lg:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Notre histoire</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl lg:text-6xl">
              Cinquante ans <span className="text-outline-brand">de récupération</span>
            </h2>
            <p className="mt-4 leading-7 text-steel">
              Chaque étape raconte comment la casse auto est devenue un centre de dépollution et de déconstruction
              automobile, engagé pour l&apos;environnement bien avant que la loi ne l&apos;impose.
            </p>
          </Reveal>
          <div className="mt-16">
            <Timeline eras={HISTORY} />
          </div>
        </div>
      </section>

      {/* Aujourd'hui */}
      <section id="agrement" className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Aujourd&apos;hui</p>
          <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Centre agréé VHU, certifié Qualicert</h2>
          <p className="mt-4 leading-7 text-steel">
            Cazenave Pièces Auto est agréé par la préfecture de Haute-Garonne pour la dépollution et la déconstruction
            des véhicules hors d&apos;usage, sous le numéro d&apos;agrément préfectoral {site.agrement}. L&apos;entreprise est
            certifiée Qualicert, membre du réseau INDRA depuis ses origines, habilitée SIV pour les démarches
            d&apos;immatriculation et centre expert pour le traitement des véhicules électriques et hybrides.
          </p>
          <ul className="mt-6 space-y-2 text-sm font-semibold text-ink">
            {["Dépollution et traçabilité de chaque véhicule", "Réemploi des pièces plutôt que production de neuf", "Recyclage à près de 95 % des véhicules traités", "Partenaires agréés pour chaque flux de déchets"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/enlevement-vehicule" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Faire enlever mon véhicule <ChevronRightIcon size={16} />
          </Link>
        </Reveal>
        <Reveal delay={0.15} className="relative">
          <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-100" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl shadow-ink/10">
            <Image src={photos.facadeSunset} alt="Façade du centre au coucher du soleil" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" className="object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Partenaires recyclage */}
      <section id="engagement" className="bg-night text-white">
        <div className="container-x py-16 lg:py-24">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Notre engagement écologique</p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">Des partenaires pour chaque matière</h2>
            <p className="mt-4 leading-7 text-white/70">
              Le secteur automobile a longtemps été le mauvais élève des déchets polluants. Nous voulons changer les
              mentalités : faire du recyclage l&apos;opportunité économique de demain.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 lg:grid-cols-3" stagger={0.1}>
            {PARTNERS.map((p) => (
              <StaggerItem key={p.name} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="font-display text-2xl font-semibold uppercase text-brand-400 hover:underline">
                  {p.name}
                </a>
                <p className="mt-3 text-sm leading-6 text-white/70">{p.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Engagements locaux */}
      <section className="container-x py-16 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Engagés localement</p>
          <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Ce que nous faisons de nos véhicules</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2" stagger={0.1}>
          {COMMITMENTS.map((c) => (
            <StaggerItem key={c.title} className="group overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={c.photo} alt={c.alt} fill sizes="(min-width: 640px) 50vw, 100vw" placeholder="blur" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl font-semibold uppercase leading-none text-ink">{c.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{c.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Recrutement */}
      <section id="recrutement" className="bg-mist">
        <div className="container-x py-16 lg:py-24">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Rejoignez-nous</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Notre plus grande force, c&apos;est l&apos;équipe</h2>
            <p className="mt-4 leading-7 text-steel">
              Ensemble, nous partageons une passion pour l&apos;automobile et un engagement à conseiller et satisfaire nos
              clients. Entreprise familiale, nous voulons que chaque membre de l&apos;équipe se sente valorisé, soutenu et
              motivé.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 lg:grid-cols-3" stagger={0.1}>
            {VALUES.map((v) => (
              <StaggerItem key={v.title} className="rounded-2xl border border-line bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">{v.kicker}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold uppercase leading-none text-ink">{v.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{v.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <h3 className="display-title text-3xl text-ink">Prêt à nous rejoindre ?</h3>
              <p className="mt-3 leading-7 text-steel">
                Envoyez-nous votre candidature : mécanique, démontage, magasin, vente au comptoir, logistique. Nous
                donnons leur chance aux profils motivés.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
              <ContactForm kind="candidature" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
