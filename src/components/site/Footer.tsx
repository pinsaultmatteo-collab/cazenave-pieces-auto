import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/brand/logo-white.png";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Pièces auto",
    links: [
      { label: "Toutes nos pièces d'occasion", href: "/pieces-auto" },
      { label: "Rechercher par marque", href: "/pieces-auto/marques" },
      { label: "Véhicules d'occasion", href: "/vehicules-occasion" },
      { label: "Enlèvement de véhicule", href: "/enlevement-vehicule" },
      { label: "Espace professionnel", href: "/espace-pro" },
    ],
  },
  {
    title: "Cazenave",
    links: [
      { label: "Qui sommes-nous", href: "/qui-sommes-nous" },
      { label: "Notre engagement écologique", href: "/qui-sommes-nous#engagement" },
      { label: "Le Mag", href: "/mag" },
      { label: "Contact", href: "/contact" },
      { label: "Je donne mon avis", href: site.social.googleReviews, external: true },
    ],
  },
  {
    title: "Besoin d'aide",
    links: [
      { label: "Livraison et retours", href: "/livraison-et-retours" },
      { label: "Garantie 12 mois", href: "/garantie" },
      { label: "Mon compte", href: "/mon-compte" },
      { label: "Mes commandes", href: "/mon-compte/commandes" },
      { label: "Conditions générales de vente", href: "/conditions-generales-de-vente" },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-night text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-700 via-brand-400 to-brand-700" />
      {/* Colonnes */}
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-7 py-8 md:gap-10 md:py-14 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-2">
          <Image src={logoWhite} alt="Cazenave Pièces Auto" className="h-12 w-auto" />
          <p className="mt-5 hidden text-sm leading-6 text-white/80 md:block">
            {site.tagline}. Centre VHU agréé, casse auto à {site.address.city}, près de Toulouse.
          </p>
          <address className="mt-4 space-y-0.5 text-[13px] not-italic text-white/80 md:mt-5 md:space-y-1 md:text-sm">
            <p className="font-semibold text-white">{site.name}</p>
            <p>
              {site.address.street}, {site.address.extra}
            </p>
            <p>
              {site.address.postcode} {site.address.city}
            </p>
            <p className="pt-2">
              <a href={site.phoneHref} className="font-semibold text-white hover:text-brand">
                {site.phone}
              </a>
              <span className="text-white/60"> · </span>
              <span>SMS </span>
              <a href={site.smsHref} className="font-semibold text-white hover:text-brand">
                {site.sms}
              </a>
            </p>
            <p>{site.hours}</p>
            <p className="text-white/60">{site.hoursClosed}</p>
          </address>
        </div>

        {columns.map((col, i) => (
          <div key={col.title} className={i === 2 ? "col-span-2 md:col-span-1" : ""}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand">{col.title}</h2>
            <ul className={`mt-3 space-y-1.5 text-[13px] md:mt-4 md:space-y-2.5 md:text-sm ${i === 2 ? "columns-2 gap-6 md:columns-1" : ""}`}>
              {col.links.map((link) =>
                "external" in link && link.external ? (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link href={link.href} className="text-white/80 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Ligne légale */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-4 text-center text-[11px] text-white/60 md:flex-row md:py-5 md:text-left md:text-xs">
          <p>
            © {year} {site.name} · Tous droits réservés · Agrément préfectoral {site.agrement}
          </p>
          <div className="flex items-center gap-4">
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Facebook
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Certifications et partenaires (obligatoires, avec liens) : bandeau blanc sous le pied de page */}
      <div className="bg-white text-ink">
        <div className="container-x py-4 md:py-6">
          <div className="flex flex-col items-center gap-3 md:gap-4 lg:flex-row lg:justify-between">
            <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.25em] text-steel">Certifications et partenaires</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 md:gap-x-8 md:gap-y-4 lg:justify-end">
              {site.partners.map((p) => {
                const external = p.href.startsWith("http");
                const img = <Image src={p.logo} alt={p.name} className="h-7 w-auto object-contain md:h-10" />;
                return (
                  <li key={p.name} className="transition-transform duration-300 ease-out hover:scale-125">
                    {external ? (
                      <a href={p.href} target="_blank" rel="noopener noreferrer" title={p.name}>
                        {img}
                      </a>
                    ) : (
                      <Link href={p.href} title={p.name}>
                        {img}
                      </Link>
                    )}
                  </li>
                );
              })}
              {site.certifications.map((c) => (
                <li key={c.name} title={c.name} className="transition-transform duration-300 ease-out hover:scale-125">
                  <Image src={c.logo} alt={c.name} className="h-7 w-auto object-contain md:h-10" />
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-center text-[11px] text-steel md:mt-4 md:text-xs lg:text-right">
            Nos partenaires recyclage :{" "}
            {site.textPartners.map((p, i) => (
              <span key={p.name}>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  {p.name}
                </a>
                {i < site.textPartners.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
