import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { site } from "@/lib/site";
import { LockIcon, UserIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <PageHero kicker="Espace client" title="Mon compte" crumbs={[{ label: "Mon compte" }]} compact />
      <div className="container-x py-12 lg:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-lg shadow-ink/5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <UserIcon size={28} />
          </span>
          <h2 className="display-title mt-5 text-3xl text-ink">Bientôt disponible</h2>
          <p className="mt-3 text-sm leading-6 text-steel">
            La création de compte, le suivi de vos commandes et vos factures arrivent avec l&apos;ouverture du paiement en
            ligne. En attendant, notre équipe vous accompagne par téléphone.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={site.phoneHref} className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-brand-400">
              {site.phone}
            </a>
            <Link href="/espace-pro" className="flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-brand">
              <LockIcon size={16} /> Espace professionnel
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
