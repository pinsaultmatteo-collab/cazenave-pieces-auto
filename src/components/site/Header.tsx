import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo-navbar.png";
import { TruckIcon } from "@/components/icons";
import { CartLink } from "./CartLink";
import { isPaymentConfigured } from "@/lib/payment/config";
import { AccountLink } from "./AccountLink";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { SearchBox } from "./SearchBox";
import { TopBar } from "./TopBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopBar />

      {/* Barre principale */}
      <div className="container-x flex items-center gap-2 py-3 min-[360px]:gap-3 lg:gap-8">
        <MobileNav />

        <Link href="/" className="shrink-0" aria-label="Accueil Cazenave Pièces Auto">
          <Image src={logo} alt="Cazenave Pièces Auto" preload sizes="(min-width: 1024px) 240px, 180px" className="h-7 w-auto min-[360px]:h-9 sm:h-10 lg:h-12" />
        </Link>

        <SearchBox id="header-search" className="hidden flex-1 md:block" />

        <nav aria-label="Compte et panier" className="ml-auto flex items-center gap-1 sm:gap-3">
          {/* Sur mobile, le suivi de commande passe dans le menu et dans « Mon compte » */}
          <Link
            href="/suivi-commande"
            className="group hidden items-center gap-2 whitespace-nowrap rounded-lg px-2 py-1 text-sm font-semibold text-ink transition hover:text-brand-700 lg:flex"
          >
            <TruckIcon size={22} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            Suivi de commande
          </Link>
          <AccountLink />
          <CartLink paymentEnabled={isPaymentConfigured()} />
        </nav>
      </div>

      {/* Navigation principale (ordinateur) */}
      <div className="hidden border-t border-line lg:block">
        <div className="container-x flex h-12 items-center justify-between">
          <NavLinks />
          <Link
            href="/espace-pro#connexion"
            className="shrink-0 whitespace-nowrap rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-ink-900 transition hover:bg-brand-600 xl:text-sm"
          >
            Espace pro
          </Link>
        </div>
      </div>
    </header>
  );
}
