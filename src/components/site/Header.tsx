import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo-navbar.png";
import { TruckIcon } from "@/components/icons";
import { CartLink } from "./CartLink";
import { isPaymentConfigured } from "@/lib/payment/config";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { SearchBox } from "./SearchBox";
import { TopBar } from "./TopBar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopBar />

      {/* Barre principale */}
      <div className="container-x flex items-center gap-3 py-3 lg:gap-8">
        <MobileNav />

        <Link href="/" className="shrink-0" aria-label="Accueil Cazenave Pièces Auto">
          <Image src={logo} alt="Cazenave Pièces Auto" priority className="h-9 w-auto sm:h-10 lg:h-12" />
        </Link>

        <SearchBox id="header-search" className="hidden flex-1 md:block" />

        <nav aria-label="Compte et panier" className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            href="/suivi-commande"
            className="group flex flex-col items-center gap-0.5 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold text-ink transition hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
          >
            <TruckIcon size={22} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            <span className="sm:hidden">Suivi</span>
            <span className="hidden sm:inline">Suivi de commande</span>
          </Link>
          <CartLink paymentEnabled={isPaymentConfigured()} />
        </nav>
      </div>

      {/* Navigation principale (ordinateur) */}
      <div className="hidden border-t border-line lg:block">
        <div className="container-x flex h-12 items-center justify-between">
          <NavLinks />
          <Link
            href="/espace-pro"
            className="shrink-0 whitespace-nowrap rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-ink-900 transition hover:bg-brand-600 xl:text-sm"
          >
            Espace pro
          </Link>
        </div>
      </div>
    </header>
  );
}
