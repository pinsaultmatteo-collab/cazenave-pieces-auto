import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import logo from "@/assets/brand/logo-navbar.png";

/**
 * Fiche « commerce local » pour Google (schema.org AutoPartsStore) :
 * adresse, coordonnées GPS, horaires, téléphone et réseaux sociaux.
 * C'est elle qui relie le site à la recherche locale (« casse auto
 * Toulouse », « pièces auto Colomiers »).
 */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    "@id": `${site.url}/#entreprise`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    logo: `${site.url}${logo.src}`,
    image: `${site.url}${photos.heroBuilding.src}`,
    telephone: site.phoneHref.replace("tel:", ""),
    foundingDate: String(site.foundedYear),
    priceRange: "€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Carte bancaire, espèces, chèque, virement",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.street}, ${site.address.extra}`,
      postalCode: site.address.postcode,
      addressLocality: site.address.city,
      addressRegion: "Occitanie",
      addressCountry: "FR",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${site.geo.latitude},${site.geo.longitude}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Toulouse" },
      { "@type": "City", name: "Colomiers" },
      { "@type": "Country", name: "France" },
    ],
    sameAs: [site.social.facebook, site.social.instagram, site.social.tiktok, site.social.linkedin],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
