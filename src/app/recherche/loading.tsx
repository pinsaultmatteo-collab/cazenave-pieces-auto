/** Attente pendant la recherche (l'identification d'une plaque prend quelques secondes). */
export default function SearchLoading() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center" role="status" aria-live="polite">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand" aria-hidden />
      <p className="mt-6 font-display text-3xl font-semibold uppercase text-ink">Recherche en cours…</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-steel">Nous identifions votre véhicule et les pièces compatibles en stock.</p>
    </div>
  );
}
