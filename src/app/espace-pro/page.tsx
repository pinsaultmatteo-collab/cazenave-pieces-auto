import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { CheckIcon, PhoneIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Espace professionnel : garages, carrossiers, assureurs",
  description:
    "Professionnels de l'automobile : compte pro, interlocuteur dédié, retrait au comptoir de Colomiers, pièces d'occasion garanties 12 mois. Garages, carrossiers, concessionnaires, assureurs, fourrières.",
  alternates: { canonical: "/espace-pro" },
};

const BENEFITS = [
  { title: "Un interlocuteur dédié", text: "Un conseiller qui connaît votre activité, joignable au comptoir, par téléphone ou par SMS." },
  { title: "Conditions professionnelles", text: "Tarification adaptée à votre volume et facturation avec TVA récupérable." },
  { title: "Disponibilité immédiate", text: "Retrait au comptoir de Colomiers le jour même pour les pièces en stock, expédition sous 24/48h sinon." },
  { title: "Pièces tracées et garanties", text: "Chaque pièce est rattachée à son véhicule d'origine, testée et garantie 12 mois." },
  { title: "Reprise de véhicules", text: "Enlèvement de vos VHU, épaves et véhicules de fourrière, avec les certificats de destruction." },
  { title: "Bientôt : commande en ligne pro", text: "Connexion à votre compte, historique des commandes et conditions appliquées automatiquement." },
];

const AUDIENCES = ["Garages et ateliers", "Carrossiers", "Concessionnaires", "Assureurs et experts", "Fourrières", "Loueurs et flottes"];

export default function ProPage() {
  return (
    <>
      <PageHero
        kicker="Espace pro"
        title={
          <>
            Professionnel de <span className="text-brand-400">l&apos;automobile</span> ?
          </>
        }
        text="Depuis 1974, les garages, carrossiers et assureurs de la région toulousaine s'appuient sur notre stock et notre comptoir. Créez votre compte professionnel."
        image={photos.counter}
        imageAlt="Comptoir professionnel Cazenave Pièces Auto"
        crumbs={[{ label: "Espace pro" }]}
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <li key={a} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white">
              {a}
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="container-x py-16 lg:py-20">
        <Reveal>
          <h2 className="display-title text-4xl text-ink sm:text-5xl">Ce que vous y gagnez</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {BENEFITS.map((b) => (
            <StaggerItem key={b.title} className="rounded-2xl border border-line bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <CheckIcon size={20} />
              </span>
              <h3 className="font-display mt-4 text-2xl font-semibold uppercase leading-none text-ink">{b.title}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">{b.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-mist">
        <div className="container-x grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:py-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Ouvrir un compte pro</p>
            <h2 className="display-title mt-3 text-4xl text-ink">Parlons de votre activité</h2>
            <p className="mt-4 leading-7 text-steel">
              Indiquez-nous votre activité, votre volume et vos besoins. Nous vous rappelons pour ouvrir votre compte et
              convenir de vos conditions.
            </p>
            <a href={site.phoneHref} className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-brand">
              <PhoneIcon size={18} /> {site.phone}
            </a>
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-3xl">
              <Image src={photos.reception} alt="Accueil du magasin" fill sizes="(min-width: 1024px) 45vw, 100vw" placeholder="blur" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
            <ContactForm defaultSubject="Espace professionnel" />
          </Reveal>
        </div>
      </section>

      <section className="container-x py-14 text-center">
        <p className="text-steel">
          Vous êtes un particulier ?{" "}
          <Link href="/pieces-auto" className="font-bold text-brand-700 hover:underline">
            Accédez directement au stock
          </Link>
          .
        </p>
      </section>
    </>
  );
}
