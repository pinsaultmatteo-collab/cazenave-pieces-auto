"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAQ } from "@/lib/faq";
import { EASE, Reveal } from "@/components/motion/Reveal";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";

function Item({ id, question, answer, open, onToggle }: { id: string; question: string; answer: string; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  return (
    <li className={`rounded-2xl border transition-colors duration-300 ${open ? "border-brand bg-white shadow-md shadow-ink/5" : "border-line bg-white/70 hover:border-ink-100"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-ink">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${open ? "bg-brand text-ink-900" : "bg-mist text-ink"}`}
        >
          <PlusIcon size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-6 text-steel">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** FAQ en accordéon, deux colonnes thématiques. */
export function Faq() {
  const [open, setOpen] = useState<string | null>("0-0");

  return (
    <section id="faq" className="bg-mist">
      <div className="container-x py-20 lg:py-28">
        <Reveal className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-700">Questions fréquentes</p>
            <h2 className="display-title mt-3 text-4xl text-ink sm:text-5xl">On vous répond</h2>
            <p className="mx-auto mt-3 max-w-xl text-steel sm:mx-0">
              Enlèvement de véhicule, compatibilité, garantie, livraison : l&apos;essentiel avant de commander.
            </p>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
            Une autre question ? Contactez-nous <ChevronRightIcon size={18} />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {FAQ.map((group, g) => (
            <Reveal key={group.title} delay={g * 0.1}>
              <h3 className="font-display text-2xl font-semibold uppercase text-ink">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.items.map((item, i) => {
                  const id = `${g}-${i}`;
                  return (
                    <Item
                      key={id}
                      id={`faq-${id}`}
                      question={item.question}
                      answer={item.answer}
                      open={open === id}
                      onToggle={() => setOpen(open === id ? null : id)}
                    />
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
