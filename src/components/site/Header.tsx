import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo-navbar.png";
import { UserIcon } from "@/components/icons";
import { CartLink } from "./CartLink";
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
            href="/mon-compte"
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
          >
            <UserIcon size={22} />
            <span className="sm:hidden">Compte</span>
            <span className="hidden sm:inline">Mon compte</span>
          </Link>
          <CartLink />
        </nav>
      </div>

      {/* Navigation principale (ordinateur) */}
      <div className="hidden border-t border-line lg:block">
        <div className="container-x flex h-12 items-center justify-between">
          <NavLinks />
          <Link
            href="/espace-pro"
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-ink-900 transition hover:bg-brand-600"
          >
            Espace pro
          </Link>
        </div>
      </div>
    </header>
  );
}
