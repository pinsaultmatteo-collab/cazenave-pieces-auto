"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account/client";
import { UserIcon } from "@/components/icons";

/** Accès « Mon compte » de l'en-tête, avec la mention PRO pour un compte professionnel connecté. */
export function AccountLink() {
  const { account } = useAccount();
  return (
    <Link
      href="/mon-compte"
      className="group relative flex flex-col items-center gap-0.5 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold text-ink transition hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
    >
      <span className="relative">
        <UserIcon size={22} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        {account && <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" />}
      </span>
      <span className="sm:hidden">Compte</span>
      <span className="hidden sm:inline">{account?.firstname ? account.firstname : "Mon compte"}</span>
      {account?.isPro && <span className="hidden rounded bg-brand px-1 text-[9px] font-bold uppercase leading-4 text-ink-900 min-[360px]:inline sm:text-[10px]">Pro</span>}
    </Link>
  );
}
