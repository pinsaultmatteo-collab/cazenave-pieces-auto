"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons";

type Kind = "contact" | "enlevement" | "candidature";
type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

const input =
  "mt-1.5 w-full rounded-xl border-2 border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-steel focus:border-brand";
const label = "block text-xs font-bold uppercase tracking-wide text-steel";

const SUBJECTS = ["Demande de pièce", "Commande en cours", "Enlèvement de véhicule", "Véhicule d'occasion", "Espace professionnel", "Autre demande"];

export function ContactForm({ kind = "contact", defaultSubject = "" }: { kind?: Kind; defaultSubject?: string }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries()) as Record<string, string>;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, kind, consent: fd.get("consent") === "on" }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Envoi impossible");
      setStatus({ state: "sent" });
      form.reset();
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Envoi impossible" });
    }
  }

  if (status.state === "sent") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-ink-900">
          <CheckIcon size={24} />
        </span>
        <p className="mt-4 font-display text-2xl font-semibold uppercase text-ink">Message envoyé</p>
        <p className="mt-2 text-sm leading-6 text-ink">
          Merci, nous vous répondons du lundi au vendredi, de 9h à 17h. Pour une urgence, appelez-nous.
        </p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="mt-5 text-sm font-bold text-brand-700 underline">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const isRemoval = kind === "enlevement";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Piège anti-robots, invisible */}
      <div className="hidden" aria-hidden>
        <label>
          Site web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Nom et prénom *
          <input name="name" required minLength={2} autoComplete="name" className={input} placeholder="Votre nom" />
        </label>
        <label className={label}>
          Téléphone
          <input name="phone" type="tel" autoComplete="tel" className={input} placeholder="06 12 34 56 78" />
        </label>
      </div>
      <label className={label}>
        E-mail *
        <input name="email" type="email" required autoComplete="email" className={input} placeholder="vous@exemple.fr" />
      </label>

      {isRemoval ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Immatriculation *
              <input name="plate" required className={`${input} uppercase`} placeholder="AB-123-CD" />
            </label>
            <label className={label}>
              Marque et modèle *
              <input name="vehicle" required className={input} placeholder="Renault Clio 2012" />
            </label>
          </div>
          <label className={label}>
            Adresse ou commune du véhicule *
            <input name="city" required className={input} placeholder="Code postal et ville" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className={label}>Le véhicule roule-t-il ? *</legend>
              <div className="mt-1.5 flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="rolling" value="oui" required className="accent-brand-700" /> Oui</label>
                <label className="flex items-center gap-2"><input type="radio" name="rolling" value="non" className="accent-brand-700" /> Non</label>
              </div>
            </fieldset>
            <fieldset>
              <legend className={label}>Accessible à une dépanneuse ? *</legend>
              <div className="mt-1.5 flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="accessible" value="oui" required className="accent-brand-700" /> Oui</label>
                <label className="flex items-center gap-2"><input type="radio" name="accessible" value="non" className="accent-brand-700" /> Non</label>
              </div>
            </fieldset>
          </div>
        </>
      ) : kind === "contact" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Sujet *
            <select name="subject" required defaultValue={defaultSubject || ""} className={input}>
              <option value="" disabled>
                Choisissez un sujet
              </option>
              {defaultSubject && !SUBJECTS.includes(defaultSubject) && <option value={defaultSubject}>{defaultSubject}</option>}
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Immatriculation (pour une pièce)
            <input name="plate" className={`${input} uppercase`} placeholder="AB-123-CD" />
          </label>
        </div>
      ) : null}

      <label className={label}>
        {isRemoval ? "Précisions (état du véhicule, accès, disponibilités)" : kind === "candidature" ? "Présentez-vous en quelques lignes *" : "Votre message *"}
        <textarea name="message" required minLength={5} rows={5} className={input} placeholder={isRemoval ? "Véhicule dans un garage fermé, disponible en semaine…" : "Décrivez votre besoin"} />
      </label>

      <label className="flex items-start gap-3 text-xs leading-5 text-steel">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-brand-700" />
        <span>
          J&apos;accepte que les données transmises soient utilisées par Cazenave Pièces Auto pour traiter ma demande. *
        </span>
      </label>

      {status.state === "error" && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message} Vous pouvez aussi nous appeler au 05 61 78 40 40.
        </p>
      )}

      <button
        type="submit"
        disabled={status.state === "sending"}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand px-8 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {status.state === "sending" ? "Envoi en cours…" : isRemoval ? "Demander l'enlèvement" : "Envoyer"}
      </button>
    </form>
  );
}
