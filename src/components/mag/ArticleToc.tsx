"use client";

import { useEffect, useState } from "react";

export type TocHeading = { id: string; text: string; level: 2 | 3 };

/**
 * Sommaire d'article : suit la lecture (section courante surlignée) et
 * permet de sauter à une section. Les ancres sont gérées par le
 * défilement fluide du site.
 */
export function ArticleToc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (!headings.length) return;
    const targets = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    // La section courante est la dernière dont le titre est passé sous l'en-tête.
    const update = () => {
      const line = 200;
      let current = targets[0].id;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Sommaire de l'article" className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-steel">Sommaire</p>
      <ol className="mt-3 space-y-1 border-l border-line">
        {headings.map((h) => {
          const current = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={current ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pr-2 text-sm leading-5 transition ${h.level === 3 ? "pl-7" : "pl-4"} ${
                  current ? "border-brand font-semibold text-ink" : "border-transparent text-steel hover:border-line hover:text-ink"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
