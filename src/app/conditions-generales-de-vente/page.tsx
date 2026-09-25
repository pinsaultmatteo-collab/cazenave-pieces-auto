import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import legal from "@/content/legal.json";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente de Cazenave Pièces Auto : commande, prix, livraison, rétractation, garanties.",
  alternates: { canonical: "/conditions-generales-de-vente" },
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  return (
    <>
      <PageHero kicker="Informations légales" title={legal.cgv.title} crumbs={[{ label: "Conditions générales de vente" }]} compact />
      <div className="container-x max-w-3xl py-12 lg:py-16">
        <Prose html={legal.cgv.html} className="text-[15px]" />
      </div>
    </>
  );
}
