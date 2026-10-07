import { z } from "zod";

/**
 * Réception des formulaires (contact, enlèvement de véhicule, candidature),
 * en JSON ou en multipart (pièce jointe CV).
 * Envoi par e-mail via Resend si RESEND_API_KEY est renseignée ; sinon le
 * message est journalisé côté serveur (développement).
 */
const optional = z.string().trim().max(200).optional().or(z.literal(""));

const schema = z.object({
  kind: z.enum(["contact", "enlevement", "candidature", "batterie", "marchand"]).default("contact"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: optional,
  preference: optional,
  subject: optional,
  plate: optional,
  vehicle: optional,
  city: optional,
  rolling: optional,
  accessible: optional,
  company: optional,
  activity: optional,
  need: optional,
  volume: optional,
  message: z.string().trim().max(5000),
  consent: z.literal(true, { error: "Le consentement est requis" }),
  /** Champ piège anti-robots : doit rester vide. */
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Boîte de réception de chaque formulaire (choix de Sophie, oct. 2026). */
const RECIPIENTS: Record<z.infer<typeof schema>["kind"], string> = {
  contact: process.env.CONTACT_TO_EMAIL ?? "contact@cazenave.net",
  enlevement: "administratif@cazenave.net",
  marchand: "administratif@cazenave.net",
  candidature: "gestion@cazenave.net",
  batterie: "direction@cazenave.net",
};
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Site cazenave.net <no-reply@cazenave.net>";
/** Limite de Vercel : 4,5 Mo par requête, pièces jointes comprises. */
const CV_MAX_BYTES = 4 * 1024 * 1024;
const FILES_MAX_TOTAL = 4.3 * 1024 * 1024;
const CV_TYPES = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const DOC_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const DOC_LABELS: Record<string, string> = { cv: "CV", kbis: "Kbis", identite: "Pièce d'identité" };

const LABELS: Record<z.infer<typeof schema>["kind"], string> = {
  contact: "Message depuis le site",
  enlevement: "Demande d'enlèvement de véhicule",
  candidature: "Candidature",
  batterie: "Batteries VE à usage industriel",
  marchand: "Inscription au groupe WhatsApp marchands",
};

const PREF_LABELS: Record<string, string> = { telephone: "téléphone", sms: "SMS", email: "e-mail" };

async function readPayload(request: Request): Promise<{ data: unknown; files: Record<string, File> }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const fd = await request.formData();
    const data: Record<string, unknown> = {};
    const files: Record<string, File> = {};
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        if (key in DOC_LABELS && value.size > 0) files[key] = value;
      } else {
        data[key] = value;
      }
    }
    data.consent = fd.get("consent") === "on" || fd.get("consent") === "true";
    return { data, files };
  }
  return { data: await request.json(), files: {} };
}

export async function POST(request: Request) {
  let payload: { data: unknown; files: Record<string, File> };
  try {
    payload = await readPayload(request);
  } catch {
    return Response.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload.data);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Merci de vérifier les champs du formulaire." }, { status: 422 });
  }
  const d = parsed.data;
  if (d.kind === "batterie" && !d.company) {
    return Response.json({ ok: false, error: "Indiquez le nom de votre société." }, { status: 422 });
  }
  if (d.kind === "marchand" && (!d.company || !d.phone)) {
    return Response.json({ ok: false, error: "Indiquez votre société et un numéro de téléphone portable." }, { status: 422 });
  }
  if (d.kind !== "enlevement" && d.kind !== "marchand" && d.message.length < 5) {
    return Response.json({ ok: false, error: "Merci de nous écrire quelques mots." }, { status: 422 });
  }

  const files = payload.files;
  if (files.cv && (files.cv.size > CV_MAX_BYTES || !CV_TYPES.has(files.cv.type))) {
    return Response.json({ ok: false, error: "Le CV doit être un PDF ou un document Word de 4 Mo maximum." }, { status: 422 });
  }
  if (d.kind === "marchand") {
    if (!files.kbis || !files.identite) {
      return Response.json({ ok: false, error: "Joignez votre Kbis et une pièce d'identité." }, { status: 422 });
    }
    for (const key of ["kbis", "identite"]) {
      const f = files[key];
      if (!DOC_TYPES.has(f.type) && !/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(f.name)) {
        return Response.json({ ok: false, error: `${DOC_LABELS[key]} : format accepté PDF ou photo (JPG, PNG).` }, { status: 422 });
      }
    }
  }
  const totalBytes = Object.values(files).reduce((s, f) => s + f.size, 0);
  if (totalBytes > FILES_MAX_TOTAL) {
    return Response.json({ ok: false, error: "Les documents sont trop lourds (4 Mo au total maximum)." }, { status: 422 });
  }
  const attached = Object.entries(files);

  const lines = [
    `Type : ${LABELS[d.kind]}`,
    `Nom : ${d.name}`,
    `E-mail : ${d.email}`,
    d.phone && `Téléphone : ${d.phone}`,
    d.preference && `Contact souhaité par : ${PREF_LABELS[d.preference] ?? d.preference}`,
    d.subject && `Sujet : ${d.subject}`,
    d.plate && `Immatriculation : ${d.plate.toUpperCase()}`,
    d.vehicle && `Véhicule : ${d.vehicle}`,
    d.city && `Lieu : ${d.city}`,
    d.rolling && `Véhicule roulant : ${d.rolling}`,
    d.accessible && `Accessible à la dépanneuse : ${d.accessible}`,
    d.company && `Société : ${d.company}`,
    d.activity && `Activité : ${d.activity}`,
    d.need && `Besoin : ${d.need}`,
    d.volume && `Volume estimé : ${d.volume}`,
    ...attached.map(([key, f]) => `${DOC_LABELS[key]} joint : ${f.name} (${Math.round(f.size / 1024)} Ko)`),
    "",
    d.message || "(aucune précision)",
  ].filter((l): l is string => typeof l === "string");
  const text = lines.join("\n");
  const subject = `[cazenave.net] ${LABELS[d.kind]}${d.subject ? ` · ${d.subject}` : ""} · ${d.name}`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[contact] RESEND_API_KEY absente, message non envoyé :\n" + text);
    return Response.json({ ok: true, delivered: false });
  }

  const attachments = attached.length
    ? await Promise.all(attached.map(async ([key, f]) => ({ filename: `${DOC_LABELS[key]} - ${f.name}`, content: Buffer.from(await f.arrayBuffer()).toString("base64") })))
    : undefined;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [RECIPIENTS[d.kind]], reply_to: d.email, subject, text, attachments }),
  });
  if (!res.ok) {
    console.error("[contact] échec Resend", res.status, await res.text());
    return Response.json({ ok: false, error: "L'envoi a échoué, merci de réessayer ou de nous appeler" }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}
