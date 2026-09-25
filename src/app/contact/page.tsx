import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Cazenave Pièces Auto à Colomiers : 05 61 78 40 40, SMS au 09 39 37 80 06, 23 chemin de la Nasque. Ouvert du lundi au vendredi de 9h à 17h.",
  alternates: { canonical: "/contact" },
};

const mapsQuery = encodeURIComponent(`${site.name}, ${site.address.street}, ${site.address.postcode} ${site.address.city}`);

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const sujet = Array.isArray(sp.sujet) ? sp.sujet[0] : sp.sujet;

  return (
    <>
      <PageHero
        kicker="Contact"
        title={
          <>
            On vous <span className="text-brand-400">répond</span>
          </>
        }
        text="Une pièce à trouver, une commande à suivre, un véhicule à enlever : appelez, écrivez ou passez au comptoir."
        image={photos.reception}
        imageAlt="Accueil du magasin Cazenave Pièces Auto"
        crumbs={[{ label: "Contact" }]}
        compact
      />
      <div className="container-x grid gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
        <Reveal>
          <h2 className="display-title text-3xl text-ink">Nous joindre</h2>
          <ul className="mt-6 space-y-5 text-sm">
            <li className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><PhoneIcon /></span>
              <div>
                <p className="font-bold text-ink">Par téléphone ou SMS</p>
                <p className="mt-1 text-steel">
                  <a href={site.phoneHref} className="font-semibold text-ink hover:text-brand-700">{site.phone}</a> · SMS au{" "}
                  <a href={site.smsHref} className="font-semibold text-ink hover:text-brand-700">{site.sms}</a>
                </p>
                <p className="mt-1 text-steel">Un doute sur une pièce ? Envoyez votre immatriculation par SMS.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ClockIcon /></span>
              <div>
                <p className="font-bold text-ink">Horaires</p>
                <p className="mt-1 text-steel">{site.hours}</p>
                <p className="text-steel">{site.hoursClosed}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><PinIcon /></span>
              <div>
                <p className="font-bold text-ink">Adresse</p>
                <address className="mt-1 not-italic text-steel">
                  {site.address.street}, {site.address.extra}
                  <br />
                  {site.address.postcode} {site.address.city}
                </address>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-bold text-brand-700 hover:underline">
                  Itinéraire
                </a>
              </div>
            </li>
          </ul>
          <div className="mt-8 overflow-hidden rounded-2xl border border-line">
            <iframe
              title="Plan d'accès Cazenave Pièces Auto"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
            <h2 className="display-title text-3xl text-ink">Écrivez-nous</h2>
            <p className="mt-2 text-sm text-steel">Réponse sous un jour ouvré.</p>
            <div className="mt-6">
              <ContactForm defaultSubject={sujet} />
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
