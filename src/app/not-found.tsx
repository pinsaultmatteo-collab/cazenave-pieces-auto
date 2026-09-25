import Link from "next/link";
import { SearchIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="grain relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(152,174,7,0.2),transparent_55%)]" />
      <div className="container-x flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">Erreur 404</p>
        <h1 className="display-title mt-4 text-6xl sm:text-8xl">
          Cette pièce <span className="text-outline-brand">n&apos;est plus en rayon</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
          La page que vous cherchez a été déplacée ou n&apos;existe plus. Notre stock, lui, change toutes les 30 minutes.
        </p>
        <form action="/recherche" method="get" role="search" className="mt-8 flex w-full max-w-xl overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur">
          <label htmlFor="nf-q" className="sr-only">
            Rechercher une pièce
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Rechercher une pièce…" className="w-full bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/50" />
          <button type="submit" className="flex items-center bg-brand px-5 text-ink-900" aria-label="Rechercher">
            <SearchIcon />
          </button>
        </form>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/" className="rounded-full bg-white px-5 py-2.5 text-ink transition hover:bg-brand-50">
            Retour à l&apos;accueil
          </Link>
          <Link href="/pieces-auto" className="rounded-full border border-white/25 px-5 py-2.5 text-white transition hover:bg-white/10">
            Voir le stock
          </Link>
          <Link href="/contact" className="rounded-full border border-white/25 px-5 py-2.5 text-white transition hover:bg-white/10">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
