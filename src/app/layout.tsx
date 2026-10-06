import type { Metadata } from "next";
import { Barlow_Condensed, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import Script from "next/script";
import { Webchat } from "@/components/site/Webchat";
import { Analytics } from "@/components/analytics/Analytics";
import { CookieBanner } from "@/components/analytics/CookieBanner";
import { gtagBootstrap } from "@/components/analytics/gtag-bootstrap";
import { site } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Titres : seules les graisses 600 et 700 servent. Pas de préchargement : sur mobile,
// la feuille de style (qui conditionne le premier affichage) passe avant.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});

const isProduction = process.env.VERCEL_ENV === "production";

// Google Analytics 4 (flux « cazenave-ga4 ») : en production uniquement, pour ne pas mêler
// les visites de test aux vraies. GA_MEASUREMENT_ID permet de tester ailleurs ;
// GOOGLE_ADS_ID (AW-…) activera le suivi des conversions Google Ads le moment venu.
const GA_ID = process.env.GA_MEASUREMENT_ID || (isProduction ? "G-3MHZ6HNL5V" : "");
const ADS_ID = process.env.GOOGLE_ADS_ID || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Pièces auto d'occasion à Toulouse et Colomiers`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
  },
  // Le site reste désindexé tant qu'il n'est pas déployé en production.
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${barlow.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {GA_ID && (
          <Script id="gtag-bootstrap" strategy="beforeInteractive">
            {gtagBootstrap(GA_ID, ADS_ID)}
          </Script>
        )}
        <SmoothScroll>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
        <Webchat />
        {GA_ID && (
          <>
            <Analytics />
            <CookieBanner />
          </>
        )}
      </body>
    </html>
  );
}
