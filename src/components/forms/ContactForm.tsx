"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/lib/site";
import { CheckIcon, PhoneIcon, PinIcon, UserIcon } from "@/components/icons";

type Kind = "contact" | "enlevement" | "candidature";
type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };
type Errors = Record<string, string | undefined>;

const SUBJECTS = ["Demande de pièce", "Commande en cours", "Enlèvement de véhicule", "Véhicule d'occasion", "Espace professionnel", "Autre demande"];
const PREFS = [
  { value: "telephone", label: "Téléphone" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "E-mail" },
];

const MESSAGE_MAX = 2000;
const CV_MAX_MB = 5;

/* ---------- règles de validation (le serveur reste juge) ---------- */
function validateField(name: string, value: string, kind: Kind): string | undefined {
  const v = value.trim();
  switch (name) {
    case "name":
      return v.length < 2 ? "Indiquez votre nom." : undefined;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? undefined : "Adresse e-mail invalide.";
    case "phone":
      if (!v) return kind === "enlevement" ? "Un numéro est nécessaire pour organiser l'enlèvement." : undefined;
      return /^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/.test(v) ? undefined : "Numéro de téléphone invalide.";
    case "plate":
      if (!v) return kind === "enlevement" ? "Indiquez l'immatriculation." : undefined;
      return /^[A-Za-z]{2}[- ]?\d{3}[- ]?[A-Za-z]{2}$/.test(v) || /^\d{1,4}[- ]?[A-Za-z]{2,3}[- ]?\d{2}$/.test(v) ? undefined : "Format attendu : AB-123-CD.";
    case "vehicle":
      return kind === "enlevement" && v.length < 3 ? "Indiquez la marque et le modèle." : undefined;
    case "city":
      return kind === "enlevement" && v.length < 3 ? "Indiquez la commune du véhicule." : undefined;
    case "subject":
      return kind === "contact" && !v ? "Choisissez un sujet." : undefined;
    case "message":
      if (kind === "enlevement") return undefined;
      return v.length < 10 ? "Quelques mots de plus nous aideront à vous répondre." : v.length > MESSAGE_MAX ? "Message trop long." : undefined;
    default:
      return undefined;
  }
}

/* ---------- briques d'interface ---------- */
const inputBase =
  "block w-full rounded-xl border border-line bg-mist/60 px-4 text-sm text-ink outline-none transition placeholder:text-steel/80 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-red-400 aria-[invalid=true]:bg-red-50/40";

function Section({ n, title, hint, children }: { n: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-base font-bold text-brand-400">{n}</span>
        <span>
          <span className="block font-display text-xl font-semibold uppercase leading-none text-ink">{title}</span>
          {hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  required,
  error,
  icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  icon?: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel">
        {label}
        {required && <span className="ml-0.5 text-brand-700">*</span>}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel">{icon}</span>}
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-steel">{hint}</p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/30 border-t-ink-900" />;
}

/* ---------- le formulaire ---------- */
export function ContactForm({ kind = "contact", defaultSubject = "" }: { kind?: Kind; defaultSubject?: string }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [messageLength, setMessageLength] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isRemoval = kind === "enlevement";
  const isJob = kind === "candidature";

  /** Validation d'un champ à la sortie (ou au changement pour les listes). */
  function onBlur(e: { target: { name: string; value: string } }) {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, kind) }));
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return setFileName(null);
    if (f.size > CV_MAX_MB * 1024 * 1024) {
      setErrors((p) => ({ ...p, cv: `Fichier trop lourd (maximum ${CV_MAX_MB} Mo).` }));
      e.target.value = "";
      return setFileName(null);
    }
    setErrors((p) => ({ ...p, cv: undefined }));
    setFileName(f.name);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("kind", kind);

    // validation complète avant envoi
    const next: Errors = {};
    for (const key of ["name", "email", "phone", "plate", "vehicle", "city", "subject", "message"]) {
      const err = validateField(key, String(fd.get(key) ?? ""), kind);
      if (err) next[key] = err;
    }
    if (isRemoval) {
      if (!fd.get("rolling")) next.rolling = "Précisez si le véhicule roule.";
      if (!fd.get("accessible")) next.accessible = "Précisez si une dépanneuse peut y accéder.";
    }
    if (!fd.get("consent")) next.consent = "Votre accord est nécessaire pour traiter la demande.";
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      const first = form.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
      first?.focus();
      return;
    }

    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Envoi impossible");
      setStatus({ state: "sent" });
      form.reset();
      setMessageLength(0);
      setFileName(null);
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Envoi impossible" });
    }
  }

  if (status.state === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center"
        role="status"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink-900"
        >
          <CheckIcon size={28} />
        </motion.span>
        <p className="mt-4 font-display text-3xl font-semibold uppercase text-ink">
          {isRemoval ? "Demande enregistrée" : isJob ? "Candidature envoyée" : "Message envoyé"}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink">
          {isRemoval
            ? "Notre service enlèvement vous rappelle sous un jour ouvré pour confirmer l'éligibilité et fixer une date."
            : "Merci, nous vous répondons du lundi au vendredi, de 9h à 17h. Pour une urgence, appelez-nous."}
        </p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="mt-5 text-sm font-bold text-brand-700 underline underline-offset-4">
          Envoyer un autre message
        </button>
      </motion.div>
    );
  }

  const invalid = (name: string) => (errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {});

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-9" noValidate>
      <div className="hidden" aria-hidden>
        <label>
          Site web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Section n="01" title="Vos coordonnées" hint="Pour vous répondre, rien d'autre.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Nom et prénom" required error={errors.name} icon={<UserIcon size={16} />}>
            <input id="name" name="name" autoComplete="name" placeholder="Camille Durand" onBlur={onBlur} className={`${inputBase} h-12 pl-10`} {...invalid("name")} />
          </Field>
          <Field id="phone" label="Téléphone" required={isRemoval} error={errors.phone} icon={<PhoneIcon size={16} />}>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" onBlur={onBlur} className={`${inputBase} h-12 pl-10`} {...invalid("phone")} />
          </Field>
        </div>
        <Field id="email" label="E-mail" required error={errors.email}>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.fr" onBlur={onBlur} className={`${inputBase} h-12`} {...invalid("email")} />
        </Field>
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-steel">Vous préférez être recontacté par</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Moyen de contact préféré">
            {PREFS.map((p, i) => (
              <label key={p.value} className="cursor-pointer">
                <input type="radio" name="preference" value={p.value} defaultChecked={i === 0} className="peer sr-only" />
                <span className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-ink-900 peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                  {p.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {isRemoval && (
        <Section n="02" title="Le véhicule" hint="Ces informations nous permettent de vérifier l'éligibilité avant de vous rappeler.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="plate" label="Immatriculation" required error={errors.plate}>
              <input id="plate" name="plate" placeholder="AB-123-CD" autoCapitalize="characters" onBlur={onBlur} className={`${inputBase} h-12 font-display text-lg uppercase tracking-[0.2em]`} {...invalid("plate")} />
            </Field>
            <Field id="vehicle" label="Marque, modèle, année" required error={errors.vehicle}>
              <input id="vehicle" name="vehicle" placeholder="Renault Clio 2012" onBlur={onBlur} className={`${inputBase} h-12`} {...invalid("vehicle")} />
            </Field>
          </div>
          <Field id="city" label="Adresse ou commune où se trouve le véhicule" required error={errors.city} icon={<PinIcon size={16} />}>
            <input id="city" name="city" placeholder="12 rue des Lilas, 31770 Colomiers" autoComplete="street-address" onBlur={onBlur} className={`${inputBase} h-12 pl-10`} {...invalid("city")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "rolling", label: "Le véhicule roule-t-il ?", hint: "Sur ses roues, même s'il ne démarre pas" },
              { name: "accessible", label: "Une dépanneuse peut-elle y accéder ?", hint: "Voie publique, cour ou parking en surface" },
            ].map((q) => (
              <div key={q.name} data-invalid={errors[q.name] ? "true" : undefined}>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-steel">
                  {q.label}
                  <span className="ml-0.5 text-brand-700">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={q.label}>
                  {["oui", "non"].map((v) => (
                    <label key={v} className="cursor-pointer">
                      <input type="radio" name={q.name} value={v} className="peer sr-only" onChange={() => setErrors((p) => ({ ...p, [q.name]: undefined }))} />
                      <span className="flex h-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold capitalize text-ink transition peer-checked:border-brand peer-checked:bg-brand-50 peer-checked:text-brand-700 peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20">
                        {v}
                      </span>
                    </label>
                  ))}
                </div>
                {errors[q.name] ? <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{errors[q.name]}</p> : <p className="mt-1.5 text-xs text-steel">{q.hint}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {kind === "contact" && (
        <Section n="02" title="Votre demande">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="subject" label="Sujet" required error={errors.subject}>
              <select id="subject" name="subject" defaultValue={defaultSubject || ""} onBlur={onBlur} onChange={onBlur} className={`${inputBase} h-12 appearance-none pr-10`} {...invalid("subject")}>
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
              <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel">
                ▾
              </span>
            </Field>
            <Field id="plate" label="Immatriculation" error={errors.plate} hint="Pour une pièce : nous vérifions la compatibilité.">
              <input id="plate" name="plate" placeholder="AB-123-CD" autoCapitalize="characters" onBlur={onBlur} className={`${inputBase} h-12 font-display text-lg uppercase tracking-[0.2em]`} {...invalid("plate")} />
            </Field>
          </div>
        </Section>
      )}

      {isJob && (
        <Section n="02" title="Votre CV" hint="PDF ou Word, 5 Mo maximum. Facultatif si vous vous présentez ci-dessous.">
          <label
            htmlFor="cv"
            className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 transition hover:border-brand hover:bg-brand-50/40 ${fileName ? "border-brand bg-brand-50/60" : "border-line bg-mist/60"}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
              <CheckIcon size={20} className={fileName ? "" : "opacity-30"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{fileName ?? "Joindre mon CV"}</span>
              <span className="block text-xs text-steel">{fileName ? "Cliquez pour remplacer le fichier" : "Glissez un fichier ou cliquez pour parcourir"}</span>
            </span>
            <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFile} className="sr-only" />
          </label>
          {errors.cv && <p role="alert" className="text-xs font-semibold text-red-600">{errors.cv}</p>}
        </Section>
      )}

      <Section n={isRemoval || kind === "contact" || isJob ? "03" : "02"} title={isRemoval ? "Précisions" : isJob ? "Présentez-vous" : "Votre message"}>
        <Field
          id="message"
          label={isRemoval ? "Informations utiles" : isJob ? "Parcours, motivations, disponibilités" : "Message"}
          required={!isRemoval}
          error={errors.message}
        >
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder={isRemoval ? "Véhicule dans un garage fermé, disponible en semaine après 17h…" : isJob ? "Mécanicien depuis 5 ans, disponible immédiatement…" : "Décrivez votre besoin : pièce recherchée, véhicule, numéro de commande…"}
            onBlur={onBlur}
            onChange={(e) => setMessageLength(e.target.value.length)}
            className={`${inputBase} py-3 leading-6`}
            {...invalid("message")}
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums text-steel">
            {messageLength}/{MESSAGE_MAX}
          </span>
        </Field>
      </Section>

      <div className="space-y-4 border-t border-line pt-6">
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-steel" data-invalid={errors.consent ? "true" : undefined}>
          <input type="checkbox" name="consent" onChange={() => setErrors((p) => ({ ...p, consent: undefined }))} className="peer sr-only" />
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-line bg-white text-ink-900 transition peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
            <CheckIcon size={14} />
          </span>
          <span>
            J&apos;accepte que les informations transmises soient utilisées par {site.name} pour traiter ma demande, conformément à ses{" "}
            <a href="/mentions-legales" className="font-semibold text-ink underline underline-offset-2">
              mentions légales
            </a>
            . <span className="text-brand-700">*</span>
          </span>
        </label>
        {errors.consent && <p role="alert" className="text-xs font-semibold text-red-600">{errors.consent}</p>}

        <AnimatePresence>
          {status.state === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {status.message}. Vous pouvez aussi nous appeler au {site.phone}.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={status.state === "sending"}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(152,174,7,0.35)] disabled:cursor-wait disabled:opacity-70"
          >
            {status.state === "sending" ? <Spinner /> : <CheckIcon size={18} />}
            {status.state === "sending" ? "Envoi en cours…" : isRemoval ? "Demander l'enlèvement" : isJob ? "Envoyer ma candidature" : "Envoyer le message"}
          </button>
          <p className="text-xs text-steel">Réponse sous un jour ouvré · {site.hoursShort}</p>
        </div>
      </div>
    </form>
  );
}
