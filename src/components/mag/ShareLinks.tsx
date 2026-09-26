"use client";

import { useState } from "react";
import { CheckIcon, FacebookIcon, LinkIcon } from "@/components/icons";

/** Partage d'un article : réseaux et copie du lien. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez le lien de l'article :", url);
    }
  };

  const item = "flex h-9 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand-700";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className={item}>
        <FacebookIcon size={14} /> Facebook
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer" className={item}>
        LinkedIn
      </a>
      <a href={`https://wa.me/?text=${text}%20${encoded}`} target="_blank" rel="noopener noreferrer" className={item}>
        WhatsApp
      </a>
      <button type="button" onClick={copy} className={item} aria-live="polite">
        {copied ? <CheckIcon size={14} className="text-brand-700" /> : <LinkIcon size={14} />}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>
    </div>
  );
}
