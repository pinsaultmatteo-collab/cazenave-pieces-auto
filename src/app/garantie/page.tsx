import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Garantie 12 mois sur les pièces d'occasion",
  description:
    "Toutes nos pièces d'occasion sont testées avant la vente et garanties 12 mois, en plus des garanties légales de conformité et des vices cachés.",
  alternates: { canonical: "/garantie" },
};

export default function WarrantyPage() {
  return (
    <>
      <PageHero
        kicker="Service client"
        title={
          <>
            Garantie <span className="text-brand-400">12 mois</span>
          </>
        }
        text="Cazenave a été la première casse auto de France à garantir ses pièces d'occasion, dès 1999. Aujourd'hui, toutes nos pièces sont garanties 12 mois."
        image={photos.studioPart}
        imageAlt="Pièce photographiée dans le studio de l'atelier"
        crumbs={[{ label: "Garantie" }]}
        compact
      />
      <div className="container-x max-w-3xl py-12 lg:py-16">
        <Reveal>
          <div className="prose-cz">
            <h2>Ce qui est garanti</h2>
            <p>
              Chaque pièce est démontée, contrôlée et testée par nos équipes avant sa mise en vente, puis photographiée
              pour que vous puissiez juger de son état. Elle bénéficie d&apos;une garantie commerciale de 12 mois à compter de
              la date d&apos;achat, en plus des garanties légales de conformité et des vices cachés prévues par le Code de la
              consommation.
            </p>
            <h2>Ce qui n&apos;est pas couvert</h2>
            <ul>
              <li>La main-d&apos;œuvre de montage et de démontage, ainsi que les frais annexes (huile, liquides, consommables).</li>
              <li>Les pièces montées sur un véhicule dont le défaut d&apos;origine n&apos;a pas été réparé (par exemple un turbo monté sur un moteur au circuit de lubrification défaillant).</li>
              <li>Les dommages liés à un montage non conforme, à une modification de la pièce ou à un usage anormal.</li>
              <li>Les pièces d&apos;usure au-delà de leur durée de vie normale.</li>
            </ul>
            <h2>Comment faire jouer la garantie</h2>
            <ol>
              <li>Contactez-nous au {site.phone} ou par e-mail avec votre numéro de commande et une description du défaut.</li>
              <li>Nous vous indiquons la marche à suivre : retour de la pièce ou contrôle sur place à Colomiers.</li>
              <li>Après vérification, nous remplaçons la pièce par une pièce équivalente ou nous vous remboursons.</li>
            </ol>
            <p>
              Le détail figure à l&apos;article 8 de nos <Link href="/conditions-generales-de-vente">conditions générales de vente</Link>.
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
