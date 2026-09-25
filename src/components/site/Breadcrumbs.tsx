import Link from "next/link";
import { site } from "@/lib/site";
import { ChevronRightIcon } from "@/components/icons";

export type Crumb = { label: string; href?: string };

/** Fil d'Ariane avec données structurées BreadcrumbList. */
export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  const all: Crumb[] = [{ label: "Accueil", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href}` } : {}),
    })),
  };
  const muted = dark ? "text-white/60" : "text-steel";
  const strong = dark ? "text-white" : "text-ink";
  return (
    <nav aria-label="Fil d'Ariane" className={`text-xs ${muted}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <Link href={c.href} className="transition hover:text-brand-400">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? `font-semibold ${strong}` : ""} aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRightIcon size={14} className="opacity-60" />}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
