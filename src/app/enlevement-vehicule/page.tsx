import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import franceMap from "@/assets/brand/france-map.png";
import { CheckIcon, PhoneIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Enlèvement gratuit de véhicule hors d'usage",
  description:
    "Centre VHU agréé à Colomiers : nous reprenons et enlevons gratuitement votre véhicule hors d'usage en Occitanie et Nouvelle-Aquitaine, démarches administratives comprises.",
  alternates: { canonical: "/enlevement-vehicule" },
};

const STEPS = [
  { n: "01", title: "Réception du dossier complet", text: "Vous nous transmettez les documents ci-dessous. Nous remplissons la déclaration de cession et vous l'envoyons pour signature." },
  { n: "02", title: "Enlèvement du véhicule", text: "Notre porte-voitures vient chercher le véhicule à l'adresse convenue, gratuitement s'il est accessible à la dépanneuse." },
  { n: "03", title: "Certificat de destruction", text: "Vous recevez le certificat de cession pour destruction, indispensable pour résilier votre assurance. Le véhicule est dépollué et recyclé." },
];

const DOCUMENTS = [
  "Carte grise originale du véhicule, barrée et signée, non datée (la date sera ajoutée le jour de l'enlèvement)",
  "Copie d'une pièce d'identité du propriétaire : carte d'identité, passeport, permis de conduire ou titre de séjour",
  "Certificat de non-gage de moins d'un mois, libre de toute opposition",
  "Déclaration de cession : nous la remplissons pour vous, ne pas la dater",
  "Autorisation d'enlèvement avec l'adresse du véhicule et un numéro de téléphone où vous joindre",
];

const CONDITIONS = [
  "Le véhicule doit être sur ses roues, non sur cales, pour pouvoir être treuillé s'il ne démarre plus.",
  "Le véhicule doit être entier : aucune pièce ne doit avoir été démontée.",
  "Le porte-voitures mesure 4,5 m de haut et 2,4 m de large : signalez-nous tout accès difficile (portail, jardin, box).",
  "Les enlèvements en sous-sol ou parking souterrain ne sont pas pris en charge.",
];

export default function RemovalPage() {
  return (
    <>
      <PageHero
        kicker="Pour professionnels et particuliers"
        title={
          <>
            Reprise et enlèvement <span className="text-brand-400">gratuits</span> de votre véhicule
          </>
        }
        text="Votre véhicule est en panne, accidenté ou trop vieux ? En tant que centre VHU agréé, nous le recyclons gratuitement et nous nous occupons de toutes les démarches administratives à votre place."
        image={photos.crane}
        imageAlt="Grue de manutention soulevant un véhicule hors d'usage"
        crumbs={[{ label: "Enlèvement de véhicule" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#demande" className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
            Demander un enlèvement
          </a>
          <a href={site.phoneHref} className="flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
            <PhoneIcon size={18} /> {site.phone}
          </a>
        </div>
      </PageHero>

      {/* Roulant / non roulant */}
      <section className="container-x grid gap-6 py-14 lg:grid-cols-2 lg:py-20">
        <Reveal className="rounded-3xl border border-line bg-white p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Votre véhicule roule</p>
          <h2 className="display-title mt-3 text-3xl text-ink">Amenez-le nous</h2>
          <p className="mt-3 leading-7 text-steel">
            Reprise immédiate au centre de Colomiers, du lundi au vendredi de 9h à 17h, avec les pièces administratives
            nécessaires. Nous éditons le certificat de cession sur place.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="rounded-3xl bg-ink p-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Votre véhicule ne roule plus</p>
          <h2 className="display-title mt-3 text-3xl">On vient le chercher</h2>
          <p className="mt-3 leading-7 text-white/75">
            Nous planifions gratuitement le remorquage de votre épave, puis nous procédons à sa dépollution et à son
            recyclage dans notre centre agréé. Intervention en régions Occitanie et Nouvelle-Aquitaine.
          </p>
        </Reveal>
      </section>

      {/* Étapes */}
      <section className="bg-night text-white">
        <div className="container-x py-16 lg:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Comment ça se passe</p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">Trois étapes, zéro démarche pour vous</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-6 lg:grid-cols-3" stagger={0.12}>
            {STEPS.map((s) => (
              <StaggerItem key={s.n} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <span className="font-display text-5xl font-bold text-brand-400">{s.n}</span>
                <h3 className="font-display mt-2 text-2xl font-semibold uppercase leading-none">{s.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Documents et conditions */}
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_0.8fr] lg:gap-16 lg:py-20">
        <div>
          <Reveal>
            <h2 className="display-title text-3xl text-ink sm:text-4xl">Documents à fournir</h2>
            <ul className="mt-6 space-y-3">
              {DOCUMENTS.map((d) => (
                <li key={d} className="flex items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink">
                  <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-ink">
              Attention : ne déclarez pas la cession sur le site de l&apos;ANTS, nous nous en chargeons.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <h2 className="display-title text-3xl text-ink sm:text-4xl">Bon à savoir pour le remorquage</h2>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-steel">
              {CONDITIONS.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {c}
                </li>
              ))}
            </ul>
            <h3 className="mt-8 font-display text-2xl font-semibold uppercase text-ink">Cas particuliers</h3>
            <dl className="mt-4 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-bold text-ink">Vous n&apos;êtes pas le propriétaire</dt>
                <dd className="text-steel">Fournissez une procuration signée par le propriétaire, la copie recto verso de sa pièce d&apos;identité en cours de validité, et votre propre pièce d&apos;identité.</dd>
              </div>
              <div>
                <dt className="font-bold text-ink">Le propriétaire est décédé</dt>
                <dd className="text-steel">En plus des documents habituels, prévoyez l&apos;acte de décès et un courrier de tous les héritiers autorisant la cession du véhicule.</dd>
              </div>
            </dl>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="rounded-3xl border border-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Zone d&apos;intervention</p>
            <h2 className="display-title mt-2 text-3xl text-ink">Occitanie et Nouvelle-Aquitaine</h2>
            <Image src={franceMap} alt="Carte de France : zone d'intervention en Occitanie et Nouvelle-Aquitaine" className="mt-4 w-full" sizes="(min-width: 1024px) 40vw, 100vw" />
            <p className="mt-2 text-xs text-steel">Enlèvement gratuit sous conditions d&apos;accessibilité. Contactez-nous pour les autres départements.</p>
          </div>
        </Reveal>
      </section>

      {/* Formulaire */}
      <section id="demande" className="bg-mist">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Demande d&apos;enlèvement</p>
            <h2 className="display-title mt-3 text-4xl text-ink">Faites estimer votre véhicule</h2>
            <p className="mt-4 leading-7 text-steel">
              Remplissez ce formulaire, notre service enlèvement vous rappelle pour confirmer l&apos;éligibilité et fixer
              une date. Vous pouvez aussi nous appeler directement au {site.phone}.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
            <ContactForm kind="enlevement" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
