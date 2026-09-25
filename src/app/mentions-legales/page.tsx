import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Prose } from "@/components/site/Prose";
import legal from "@/content/legal.json";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et politique de protection des données du site cazenave.net.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <>
      <PageHero kicker="Informations légales" title={legal.mentions.title} crumbs={[{ label: "Mentions légales" }]} compact />
      <div className="container-x max-w-3xl py-12 lg:py-16">
        <Prose html={legal.mentions.html} className="text-[15px]" />
      </div>
    </>
  );
}
