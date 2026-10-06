"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_OPEN_EVENT, openConsentSettings, readConsent, saveConsent } from "@/lib/analytics";

type View = "closed" | "banner" | "settings";

const PURPOSES = [
  {
    key: "analytics" as const,
    title: "Mesure d'audience",
    text: "Google Analytics : pages consultées, recherches, ajouts au panier et commandes, pour améliorer le site. Données statistiques, sans vous identifier.",
  },
  {
    key: "ads" as const,
    title: "Publicité",
    text: "Google Ads : mesurer l'efficacité de nos annonces Google (visites et commandes qui en proviennent).",
  },
];

/**
 * Bandeau cookies (recommandations CNIL) : accepter et refuser sont aussi
 * simples l'un que l'autre, choix par finalité possible, choix modifiable à
 * tout moment depuis le pied de page et redemandé au bout de 6 mois.
 */
export function CookieBanner() {
  const [view, setView] = useState<View>("closed");
  const [choice, setChoice] = useState({ analytics: false, ads: false });

  useEffect(() => {
    // Lecture du stockage local après le premier rendu (indisponible côté serveur)
    const stored = readConsent();
    const t = window.setTimeout(() => {
      if (!stored) setView("banner");
    }, 0);
    const onOpen = () => {
      const c = readConsent();
      setChoice({ analytics: c?.analytics ?? false, ads: c?.ads ?? false });
      setView("settings");
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
    };
  }, []);

  // Bulle du chat Locomotive masquée tant que le bandeau est ouvert (elle le recouvrait sur téléphone)
  useEffect(() => {
    const root = document.documentElement;
    if (view === "closed") delete root.dataset.cookieBanner;
    else root.dataset.cookieBanner = "open";
  }, [view]);

  const decide = (c: { analytics: boolean; ads: boolean }) => {
    saveConsent(c);
    setView("closed");
  };

  if (view === "closed") return null;

  const button = "rounded-full px-5 py-2.5 text-sm font-bold transition";
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookies-title"
      className="fixed inset-x-4 bottom-4 z-[2147483647] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-line bg-white p-5 text-ink shadow-2xl shadow-ink/25 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-md"
      data-lenis-prevent
    >
      <p id="cookies-title" className="font-display text-xl font-semibold uppercase leading-tight">
        Vos choix en matière de cookies
      </p>
      {view === "banner" ? (
        <p className="mt-2 text-sm leading-6 text-steel">
          Avec votre accord, nous utilisons des cookies Google pour mesurer l&apos;audience du site et l&apos;efficacité de nos
          annonces. Vous pouvez changer d&apos;avis à tout moment via « Gestion des cookies » en bas de page.{" "}
          <Link href="/mentions-legales" className="font-semibold text-brand-700 underline">
            En savoir plus
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {PURPOSES.map((p) => (
            <li key={p.key}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 transition hover:border-brand">
                <input
                  type="checkbox"
                  checked={choice[p.key]}
                  onChange={(e) => setChoice((c) => ({ ...c, [p.key]: e.target.checked }))}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#98ae07]"
                />
                <span>
                  <span className="block text-sm font-bold">{p.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-steel">{p.text}</span>
                </span>
              </label>
            </li>
          ))}
          <li className="px-1 text-xs leading-5 text-steel">
            Les cookies nécessaires au fonctionnement du site (panier, connexion à votre compte) sont toujours actifs.
          </li>
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => decide({ analytics: false, ads: false })} className={`${button} flex-1 bg-ink text-white hover:bg-ink-700`}>
          Tout refuser
        </button>
        <button type="button" onClick={() => decide({ analytics: true, ads: true })} className={`${button} flex-1 bg-brand text-ink-900 hover:bg-brand-400`}>
          Tout accepter
        </button>
        {view === "banner" ? (
          <button type="button" onClick={() => setView("settings")} className="w-full pt-1 text-center text-xs font-semibold text-steel underline hover:text-ink">
            Choisir par finalité
          </button>
        ) : (
          <button type="button" onClick={() => decide(choice)} className={`${button} w-full border border-line text-ink hover:border-brand`}>
            Enregistrer mes choix
          </button>
        )}
      </div>
    </div>
  );
}

/** Lien du pied de page pour rouvrir le bandeau et modifier ses choix. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      Gestion des cookies
    </button>
  );
}
