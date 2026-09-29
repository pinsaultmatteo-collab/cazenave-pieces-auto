"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";

const MAX_BYTES = 4 * 1024 * 1024;
const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Réduit une photo de document (téléphone) : 2000 px maximum, JPEG. */
async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE.has(file.type) || file.size < 700 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

const sizeLabel = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`);

/**
 * Zone de dépôt d'un justificatif (PDF ou photo). Les photos sont réduites
 * dans le navigateur avant l'envoi, puis replacées dans le champ du
 * formulaire pour être transmises avec lui.
 */
export function DocumentDrop({
  name,
  label,
  hint,
  error,
  onValid,
}: {
  name: string;
  label: string;
  hint: string;
  error?: string;
  onValid: (name: string, error?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const original = input.files?.[0];
    if (!original) {
      setFile(null);
      return;
    }
    setBusy(true);
    const ready = await compressImage(original);
    setBusy(false);
    if (ready.size > MAX_BYTES) {
      input.value = "";
      setFile(null);
      onValid(name, "Fichier trop lourd (4 Mo maximum) : envoyez une photo ou un PDF plus léger.");
      return;
    }
    if (ready !== original) {
      const dt = new DataTransfer();
      dt.items.add(ready);
      input.files = dt.files;
    }
    setFile({ name: ready.name, size: ready.size });
    onValid(name, undefined);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
  };

  return (
    <div data-invalid={error ? "true" : undefined}>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-steel">
        {label}
        <span className="ml-0.5 text-brand-700">*</span>
      </p>
      <label
        htmlFor={`doc-${name}`}
        className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-3.5 transition hover:border-brand hover:bg-brand-50/40 ${
          error ? "border-red-400 bg-red-50/40" : file ? "border-brand bg-brand-50/60" : "border-line bg-mist/60"
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm">
          <CheckIcon size={18} className={file ? "" : "opacity-30"} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">{busy ? "Préparation du fichier…" : (file?.name ?? "Joindre le document")}</span>
          <span className="block text-xs text-steel">{file ? `${sizeLabel(file.size)} · cliquez pour remplacer` : hint}</span>
        </span>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              clear();
            }}
            aria-label={`Retirer ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-steel hover:bg-white hover:text-red-600"
          >
            <CloseIcon size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          id={`doc-${name}`}
          name={name}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"
          onChange={onChange}
          className="sr-only"
        />
      </label>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
