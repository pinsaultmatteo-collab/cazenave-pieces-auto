import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description:
    "Expédition sous 24/48h partout en France, en Union européenne et à l'export, ou retrait gratuit au comptoir de Colomiers. Rétractation et retours des pièces achetées en ligne.",
  alternates: { canonical: "/livraison-et-retours" },
};

export default function DeliveryPage() {
  return (
    <>
      <PageHero
        kicker="Service client"
        title={
          <>
            Livraison <span className="text-brand-400">et retours</span>
          </>
        }
        image={photos.truck}
        imageAlt="Camion Cazenave Pièces Auto"
        crumbs={[{ label: "Livraison et retours" }]}
        compact
      />
      <div className="container-x max-w-3xl py-12 lg:py-16">
        <Reveal>
          <div className="prose-cz">
            <h2>Expédition</h2>
            <p>
              Votre commande est préparée et expédiée sous 24 à 48 heures ouvrées après encaissement du paiement. Les
              pièces sont emballées et calées pour supporter le transport. Nous livrons partout en France, dans l&apos;Union
              européenne et à l&apos;export.
            </p>
            <p>
              Les frais de port dépendent du poids et du volume de la pièce. Ils sont affichés sur chaque fiche pièce et
              dans le panier avant validation. Les pièces volumineuses (moteurs, boîtes de vitesses, éléments de
              carrosserie de grande taille) font l&apos;objet d&apos;un devis transport sur demande.
            </p>
            <h2>Retrait sur place</h2>
            <p>
              Vous pouvez retirer gratuitement votre commande au comptoir de Colomiers, {site.address.street}, du lundi au
              vendredi de 9h à 17h. Nous vous prévenons dès que la pièce est prête.
            </p>
            <h2>Droit de rétractation</h2>
            <p>
              Pour un achat en ligne, vous disposez de 15 jours calendaires à compter de la réception pour exercer votre
              droit de rétractation, sans avoir à vous justifier. Vous avez ensuite 14 jours pour nous renvoyer la pièce,
              dans son état d&apos;origine et non montée, à l&apos;adresse : {site.legalName}, {site.address.street}, {site.address.extra},{" "}
              {site.address.postcode} {site.address.city}.
            </p>
            <p>
              Le remboursement intervient sous 14 jours après réception de la pièce, frais de livraison aller compris sur
              la base du tarif standard le moins cher. Les frais de retour restent à votre charge.
            </p>
            <h2>Achats au comptoir</h2>
            <p>
              Les pièces achetées au comptoir ne sont ni reprises, ni échangées, ni remboursées, sauf défaillance avérée
              couverte par la garantie. La plupart des pièces sont démontées à votre demande, ce qui engendre des frais
              techniques irrécupérables. Une erreur de diagnostic ou de référence ne constitue pas un motif de reprise :
              en cas de doute, envoyez-nous votre immatriculation par SMS avant de commander.
            </p>
            <p>
              Le détail complet figure dans nos <Link href="/conditions-generales-de-vente">conditions générales de vente</Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
