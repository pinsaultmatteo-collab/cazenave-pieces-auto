import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

type PaginationProps = {
  page: number;
  pages: number;
  /** Chemin de base, sans paramètre `page`. */
  basePath: string;
  /** Paramètres à conserver (filtres, tri). */
  params?: Record<string, string | undefined>;
};

function href(basePath: string, params: Record<string, string | undefined> | undefined, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) sp.set(k, v);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, pages, basePath, params }: PaginationProps) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const btn = "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(basePath, params, page - 1)} className={`${btn} border-line bg-white text-ink hover:border-brand`} aria-label="Page précédente">
          <ChevronRightIcon size={16} className="rotate-180" />
        </Link>
      )}
      {numbers.map((n, i) => {
        const gap = i > 0 && n - numbers[i - 1] > 1;
        return (
          <span key={n} className="flex items-center gap-2">
            {gap && <span className="text-steel">…</span>}
            {n === page ? (
              <span className={`${btn} border-brand bg-brand text-ink-900`} aria-current="page">
                {n}
              </span>
            ) : (
              <Link href={href(basePath, params, n)} className={`${btn} border-line bg-white text-ink hover:border-brand`}>
                {n}
              </Link>
            )}
          </span>
        );
      })}
      {page < pages && (
        <Link href={href(basePath, params, page + 1)} className={`${btn} border-line bg-white text-ink hover:border-brand`} aria-label="Page suivante">
          <ChevronRightIcon size={16} />
        </Link>
      )}
    </nav>
  );
}
