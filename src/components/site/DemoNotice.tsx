import { isDemoData } from "@/lib/catalog";

/** Rappel discret tant que le catalogue affiche le jeu de démonstration. */
export function DemoNotice({ className = "" }: { className?: string }) {
  if (!isDemoData()) return null;
  return (
    <p className={`rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 py-2.5 text-xs text-ink ${className}`}>
      <span className="font-bold text-brand-700">Données de démonstration.</span> Les pièces, véhicules, prix et
      disponibilités affichés sont fictifs. Ils seront remplacés par le stock réel dès la synchronisation Opisto.
    </p>
  );
}
