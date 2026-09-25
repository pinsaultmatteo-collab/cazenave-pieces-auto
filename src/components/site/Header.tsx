import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo-navbar.png";
import { site } from "@/lib/site";
import { CartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MobileNav } from "./MobileNav";
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

        <form action="/recherche" method="get" role="search" className="hidden flex-1 md:flex">
          <label htmlFor="header-search" className="sr-only">
            Rechercher une pièce
          </label>
          <div className="flex w-full overflow-hidden rounded-full border border-line bg-mist transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Rechercher une pièce, une référence constructeur…"
              className="w-full bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-steel"
            />
            <button
              type="submit"
              className="flex items-center bg-ink px-5 text-white transition hover:bg-ink-700"
              aria-label="Rechercher"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        <nav aria-label="Compte et panier" className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            href="/mon-compte"
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
          >
            <UserIcon size={22} />
            <span className="sm:hidden">Compte</span>
            <span className="hidden sm:inline">Mon compte</span>
          </Link>
          <Link
            href="/panier"
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink hover:text-brand-700 sm:flex-row sm:gap-2 sm:text-sm"
          >
            <CartIcon size={22} />
            <span>Panier</span>
          </Link>
        </nav>
      </div>

      {/* Navigation principale (ordinateur) */}
      <div className="hidden border-t border-line lg:block">
        <div className="container-x flex h-12 items-center justify-between">
          <ul className="flex items-center gap-7 text-sm font-semibold">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="py-3 transition hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
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
