"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";

/** Rubrique active pour une adresse donnée (les fiches et sous-pages comptent pour leur rubrique). */
export function activeNavHref(pathname: string): string | null {
  if (pathname === "/") return null;
  if (pathname.startsWith("/piece/") || pathname.startsWith("/pieces-auto") || pathname.startsWith("/recherche")) return "/pieces-auto";
  if (pathname.startsWith("/vehicule")) return "/vehicules-occasion";
  const match = site.nav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.href ?? null;
}

/** Liens de navigation principale avec repère coloré glissant sous la page courante. */
export function NavLinks() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const active = activeNavHref(pathname);

  return (
    <ul className="flex items-center gap-7 text-sm font-semibold">
      {site.nav.map((item) => {
        const current = item.href === active;
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`relative block py-3 transition-colors hover:text-brand-700 ${current ? "text-brand-700" : "text-ink"}`}
            >
              {item.label}
            </Link>
            {current && (
              <motion.span
                layoutId={reduce ? undefined : "nav-indicator"}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-brand"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
