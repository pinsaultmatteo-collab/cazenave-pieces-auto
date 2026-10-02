import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { OrderTracker } from "@/components/orders/OrderTracker";
import { getSessionEmail } from "@/lib/account/session";

export const metadata: Metadata = {
  title: "Suivi de commande",
  description: "Suivez votre commande de pièces auto d'occasion Cazenave : état, numéro de colis et facture.",
  robots: { index: false, follow: true },
};

export default async function OrderTrackingPage({ searchParams }: PageProps<"/suivi-commande">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.toUpperCase().slice(0, 20) : "";
  return (
    <>
      <PageHero kicker="Espace client" title="Suivi de commande" crumbs={[{ label: "Suivi de commande" }]} compact />
      <div className="container-x py-10 lg:py-14">
        <OrderTracker initialRef={ref} initialEmail={(await getSessionEmail()) ?? ""} />
      </div>
    </>
  );
}
