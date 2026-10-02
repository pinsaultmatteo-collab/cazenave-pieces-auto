"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account/client";
import { LoginForm } from "./LoginForm";
import { CheckIcon } from "@/components/icons";

/**
 * Espace pro : connexion, ou état du compte connecté (pro reconnu par
 * Opisto, ou compte à faire passer en professionnel).
 */
export function ProAccess({ discountPercent }: { discountPercent: number }) {
  const { account } = useAccount();

  if (account?.isPro) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-700">
          <CheckIcon size={16} /> Connecté en compte professionnel
        </p>
        <p className="display-title mt-2 text-3xl text-ink">{account.company ?? account.firstname ?? account.email}</p>
        <p className="mt-3 text-sm leading-6 text-ink">
          Vos tarifs professionnels (-{Math.round(account.discountRate * 100)} %) s&apos;affichent sur tout le site : prix public barré, prix pro en
          gras. Ils sont appliqués automatiquement à vos commandes en ligne.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/pieces-auto" className="rounded-full bg-ink px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ink-700">
            Voir le stock
          </Link>
          <Link href="/mon-compte" className="rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-brand">
            Mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-steel">Connecté avec {account.email}</p>
        <p className="display-title mt-2 text-3xl text-ink">Compte non professionnel</p>
        <p className="mt-3 text-sm leading-6 text-steel">
          Votre adresse n&apos;est pas encore enregistrée comme professionnelle chez nous. Faites votre demande ci-dessous : une fois votre compte
          activé, vos tarifs pro (-{discountPercent} %) s&apos;afficheront à votre prochaine connexion.
        </p>
        <a href="#demande" className="mt-5 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400">
          Demander mon compte pro
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-lg shadow-ink/5 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-700">Déjà client professionnel ?</p>
      <p className="display-title mt-2 text-3xl text-ink">Connexion pro</p>
      <LoginForm intro={`Connectez-vous avec l'adresse e-mail de votre compte professionnel : vos tarifs pro (-${discountPercent} %) s'affichent alors sur tout le site.`} />
    </div>
  );
}
