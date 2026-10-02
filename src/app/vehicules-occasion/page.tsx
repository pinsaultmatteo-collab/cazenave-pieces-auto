import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { DemoNotice } from "@/components/site/DemoNotice";
import { VehicleCard } from "@/components/catalog/VehicleCard";
import { Pagination } from "@/components/catalog/Pagination";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { getVehicles } from "@/lib/catalog";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";
import { CheckIcon, PhoneIcon, ShieldIcon, WhatsappIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Véhicules d'occasion à vendre",
  description:
    "Véhicules d'occasion complets à vendre aux professionnels de l'automobile à Colomiers, près de Toulouse. Marchands et garages : rejoignez notre groupe WhatsApp pour recevoir nos offres en avant-première.",
  alternates: { canonical: "/vehicules-occasion" },
};

/** Stock synchronisé avec Opisto : rendu mis en cache 10 minutes. */
export const revalidate = 600;

const DEALER_STEPS = [
  { title: "Envoyez vos justificatifs", text: "Kbis de moins de trois mois, pièce d'identité du gérant et numéro de téléphone portable, via le formulaire ci-contre." },
  { title: "Nous vérifions", text: "Notre équipe contrôle votre statut de professionnel de l'automobile." },
  { title: "Recevez les offres", text: "Nous ajoutons votre numéro au groupe WhatsApp : nouveaux véhicules, photos et prix, avant leur mise en ligne." },
];

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicules-occasion">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const result = await getVehicles({ page });

  return (
    <>
      <PageHero
        kicker="Réservé aux professionnels"
        title={
          <>
            Véhicules <span className="text-brand-400">d&apos;occasion</span>
          </>
        }
        text="Une sélection de véhicules complets, révisés et documentés, à vendre directement depuis notre parc de Colomiers. La vente de véhicules d'occasion est exclusivement réservée aux professionnels de l'automobile (marchands, garages, négociants) sur présentation d'un Kbis. Visites et essais sur rendez-vous."
        image={photos.heroDrone}
        imageAlt="Vue aérienne du parc de véhicules"
        crumbs={[{ label: "Véhicules d'occasion" }]}
        compact
      >
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-400/50 bg-brand/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-400">
          <ShieldIcon size={16} className="shrink-0" /> Vente aux professionnels uniquement · Kbis demandé
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#vehicules" className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
            Voir les véhicules
          </a>
          <a
            href="#marchands"
            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
          >
            <WhatsappIcon size={18} /> Professionnels : offres en avant-première
          </a>
        </div>
      </PageHero>

      <section id="vehicules" className="container-x scroll-mt-44 py-10 lg:py-14">
        <DemoNotice className="mb-6" />
        <p className="text-center text-sm font-semibold text-ink sm:text-left">
          {result.total > 0 ? `${result.total.toLocaleString("fr-FR")} véhicule${result.total > 1 ? "s" : ""} à vendre` : "Aucun véhicule à vendre pour le moment"}
        </p>
        {result.total > 0 ? (
          <>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((v) => (
                <li key={v.id}>
                  <VehicleCard vehicle={v} />
                </li>
              ))}
            </ul>
            <Pagination page={result.page} pages={result.pages} basePath="/vehicules-occasion" />
          </>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-2xl font-semibold uppercase text-ink">Nouveaux véhicules très bientôt</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-steel">
              Notre sélection change régulièrement. Appelez-nous au{" "}
              <a href={site.phoneHref} className="font-bold text-ink">
                {site.phone}
              </a>{" "}
              pour connaître les prochains arrivages.
            </p>
          </div>
        )}
      </section>

      {/* Professionnels : groupe WhatsApp */}
      <section id="marchands" className="grain relative scroll-mt-44 overflow-clip bg-night text-white">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(37,211,102,0.14),transparent_55%)]" />
        <div className="container-x grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14 lg:py-20">
          <Reveal className="text-center lg:sticky lg:top-48 lg:text-left">
            <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-400 lg:justify-start">
              <WhatsappIcon size={16} className="text-[#25d366]" /> Professionnels de l&apos;automobile
            </p>
            <h2 className="display-title mt-3 text-4xl sm:text-5xl">
              Nos véhicules <span className="text-outline-brand">en avant-première</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-white/75 lg:mx-0">
              Vous êtes marchand ou professionnel de l&apos;automobile ? Rejoignez notre groupe WhatsApp : nous y diffusons nos véhicules
              d&apos;occasion à vendre avant tout le monde, avec photos et prix.
            </p>
            <ol className="mt-8 space-y-4 text-left">
              {DEALER_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25d366] font-display text-lg font-semibold text-night">{i + 1}</span>
                  <span>
                    <span className="block font-bold">{s.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-white/70">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <ul className="mt-6 space-y-2 text-left text-sm text-white/75">
              {["Réservé aux professionnels justifiant d'un Kbis", "Documents utilisés uniquement pour vérifier votre statut", "Désinscription du groupe à tout moment"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckIcon size={16} className="mt-0.5 shrink-0 text-brand-400" /> {t}
                </li>
              ))}
            </ul>
            <a href={site.phoneHref} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-brand-400">
              <PhoneIcon size={16} className="text-brand-400" /> Une question : {site.phone}
            </a>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl bg-white p-6 text-ink shadow-2xl shadow-black/30 sm:p-8">
            <ContactForm kind="marchand" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
