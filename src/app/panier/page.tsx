import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { CartView } from "@/components/catalog/CartView";

export const metadata: Metadata = {
  title: "Mon panier",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <PageHero kicker="Commande" title="Mon panier" crumbs={[{ label: "Panier" }]} compact />
      <div className="container-x py-10 lg:py-14">
        <CartView />
      </div>
    </>
  );
}
