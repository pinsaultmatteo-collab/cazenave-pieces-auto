/** Rendu d'un contenu HTML éditorial (articles du Mag, textes légaux). */
export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose-cz ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
