"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAccount } from "@/lib/account/client";
import type { PublicAccount } from "@/lib/account/pricing";
import { CheckIcon, LockIcon } from "@/components/icons";

const inputBase =
  "block h-12 w-full rounded-xl border border-line bg-mist/60 px-4 text-sm text-ink outline-none transition placeholder:text-steel/80 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15";

/**
 * Connexion sans mot de passe : e-mail, puis code à 6 chiffres reçu par
 * e-mail. Après connexion, la page est rafraîchie (tarifs, commandes).
 */
export function LoginForm({ intro, onDone }: { intro?: string; onDone?: (account: PublicAccount) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const json = (await res.json()) as { ok?: boolean; error?: string; devCode?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Envoi impossible");
      setDevCode(json.devCode ?? null);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setBusy(false);
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
      const json = (await res.json()) as { account?: PublicAccount; error?: string };
      if (!res.ok || !json.account) throw new Error(json.error ?? "Connexion impossible");
      setAccount(json.account);
      onDone?.(json.account);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
      setBusy(false);
    }
  };

  return (
    <div>
      {intro && <p className="text-sm leading-6 text-steel">{intro}</p>}
      {step === "email" ? (
        <form onSubmit={askCode} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel">
              Adresse e-mail
            </label>
            <input id="login-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className={inputBase} />
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:opacity-60">
            <LockIcon size={18} /> {busy ? "Envoi…" : "Recevoir mon code"}
          </button>
          <p className="text-xs leading-5 text-steel">Pas de mot de passe : nous vous envoyons un code à usage unique, valable 15 minutes.</p>
        </form>
      ) : (
        <form onSubmit={login} className="mt-5 space-y-4" noValidate>
          <p className="flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink">
            <CheckIcon size={18} className="mt-0.5 shrink-0 text-brand-700" />
            <span>
              Code envoyé à <strong>{email}</strong>. Pensez à vérifier vos courriers indésirables.
            </span>
          </p>
          {devCode && <p className="rounded-xl border border-dashed border-line px-4 py-2 text-xs text-steel">Mode développement, e-mails désactivés : code {devCode}</p>}
          <div>
            <label htmlFor="login-code" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel">
              Code à 6 chiffres
            </label>
            <input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${inputBase} text-center font-display text-2xl tracking-[0.5em]`}
              autoFocus
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy || code.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 transition hover:bg-brand-400 disabled:opacity-60">
            {busy ? "Connexion…" : "Me connecter"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="w-full text-center text-xs font-semibold text-steel underline hover:text-ink"
          >
            Changer d&apos;adresse ou renvoyer un code
          </button>
        </form>
      )}
    </div>
  );
}
