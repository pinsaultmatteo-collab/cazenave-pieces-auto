import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import franceMap from "@/assets/brand/france-map.png";
import { CheckIcon, PhoneIcon, PinIcon } from "@/components/icons";

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

      {/* Contenu défilant à gauche, carte fixe à droite */}
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_0.72fr] lg:gap-16 lg:py-24">
        <div className="space-y-20">
          {/* Roulant / non roulant */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Reveal className="rounded-3xl border border-line bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Votre véhicule roule</p>
              <h2 className="display-title mt-3 text-3xl text-ink">Amenez-le nous</h2>
              <p className="mt-3 text-sm leading-7 text-steel">
                Reprise immédiate au centre de Colomiers, du lundi au vendredi de 9h à 17h, avec les pièces administratives
                nécessaires. Nous éditons le certificat de cession sur place.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="rounded-3xl bg-ink p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Votre véhicule ne roule plus</p>
              <h2 className="display-title mt-3 text-3xl">On vient le chercher</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Nous planifions gratuitement le remorquage de votre épave, puis nous procédons à sa dépollution et à son
                recyclage dans notre centre agréé.
              </p>
            </Reveal>
          </div>

          {/* Étapes */}
          <div>
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Comment ça se passe</p>
              <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Trois étapes, zéro démarche pour vous</h2>
            </Reveal>
            <Stagger className="mt-8 space-y-4" stagger={0.12}>
              {STEPS.map((s) => (
                <StaggerItem key={s.n} className="flex gap-5 rounded-2xl border border-line bg-white p-6">
                  <span className="font-display text-5xl font-bold leading-none text-brand">{s.n}</span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold uppercase leading-none text-ink">{s.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-steel">{s.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Documents */}
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Le dossier</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Documents à fournir</h2>
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

          {/* Conditions */}
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Le remorquage</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Bon à savoir</h2>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-steel">
              {CONDITIONS.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Cas particuliers */}
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Situations spécifiques</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">Cas particuliers</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-6">
                <dt className="font-display text-xl font-semibold uppercase leading-none text-ink">Vous n&apos;êtes pas le propriétaire</dt>
                <dd className="mt-3 text-sm leading-6 text-steel">
                  Fournissez une procuration signée par le propriétaire, la copie recto verso de sa pièce d&apos;identité en cours
                  de validité, et votre propre pièce d&apos;identité.
                </dd>
              </div>
              <div className="rounded-2xl border border-line bg-white p-6">
                <dt className="font-display text-xl font-semibold uppercase leading-none text-ink">Le propriétaire est décédé</dt>
                <dd className="mt-3 text-sm leading-6 text-steel">
                  En plus des documents habituels, prévoyez l&apos;acte de décès et un courrier de tous les héritiers autorisant
                  la cession du véhicule.
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        {/* Carte fixe */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-ink/10">
              <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">Zone d&apos;intervention</p>
                <h2 className="display-title text-xl text-ink">Occitanie et Nouvelle-Aquitaine</h2>
              </div>
              <div className="relative mx-auto max-w-[300px] px-4 pt-3">
                <Image src={franceMap} alt="Carte de France : zone d'intervention en Occitanie et Nouvelle-Aquitaine" className="w-full" sizes="300px" />
                {/* Repère Colomiers */}
                <span aria-hidden className="absolute left-[46%] top-[71%] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-ink shadow" />
                </span>
                <span aria-hidden className="absolute left-[46%] top-[71%] ml-3 -translate-y-1/2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  Colomiers
                </span>
              </div>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-5 pb-1 pt-2 text-[11px] text-steel">
                <li className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-brand" /> Enlèvement gratuit sous conditions
                </li>
                <li className="flex items-center gap-1.5">
                  <PinIcon size={13} className="text-ink" /> Centre agréé VHU, {site.address.city}
                </li>
              </ul>
              <div className="m-4 mt-3 rounded-2xl bg-mist p-3">
                <p className="mb-2.5 text-center text-[11px] text-steel">Hors zone ou accès difficile ? Appelez-nous, nous trouvons une solution.</p>
                <div className="grid grid-cols-2 gap-2">
                  <a href={site.phoneHref} className="flex items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-2.5 text-xs font-bold text-white transition hover:bg-ink-700">
                    <PhoneIcon size={14} /> {site.phone}
                  </a>
                  <a href="#demande" className="flex items-center justify-center rounded-full bg-brand px-3 py-2.5 text-center text-xs font-bold text-ink-900 transition hover:bg-brand-400">
                    Demander un enlèvement
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </aside>
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
            <ul className="mt-6 space-y-2 text-sm text-ink">
              {["Rappel sous un jour ouvré", "Déclaration de cession remplie par nos soins", "Certificat de destruction remis après enlèvement"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckIcon size={16} className="text-brand" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
            <ContactForm kind="enlevement" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
