"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeNavHref } from "./NavLinks";
import { site } from "@/lib/site";
import { CloseIcon, MenuIcon, PhoneIcon, SearchIcon } from "@/components/icons";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const active = activeNavHref(usePathname());

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="-ml-2 rounded-lg p-2 text-ink hover:bg-mist"
      >
        {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-6rem)] overflow-y-auto border-t border-line bg-white shadow-lg"
        >
          <form action="/recherche" method="get" role="search" className="p-4">
            <label htmlFor="mobile-search" className="sr-only">
              Rechercher une pièce
            </label>
            <div className="flex overflow-hidden rounded-full border border-line bg-mist">
              <input
                id="mobile-search"
                name="q"
                type="search"
                placeholder="Rechercher une pièce…"
                className="w-full bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-steel"
              />
              <button type="submit" className="bg-ink px-4 text-white" aria-label="Rechercher">
                <SearchIcon />
              </button>
            </div>
          </form>

          <ul className="divide-y divide-line border-t border-line">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.href === active ? "page" : undefined}
                  className={`block border-l-4 px-5 py-3.5 text-base font-semibold hover:bg-mist ${
                    item.href === active ? "border-brand bg-brand-50 text-brand-700" : "border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/espace-pro"
                onClick={() => setOpen(false)}
                className="block px-5 py-3.5 text-base font-bold text-brand-700 hover:bg-mist"
              >
                Espace pro
              </Link>
            </li>
          </ul>

          <div className="flex items-center justify-between gap-3 bg-mist px-5 py-4 text-sm">
            <a href={site.phoneHref} className="flex items-center gap-2 font-semibold">
              <PhoneIcon size={18} />
              {site.phone}
            </a>
            <span className="text-steel">{site.hoursShort}</span>
          </div>
        </div>
      )}
    </div>
  );
}
