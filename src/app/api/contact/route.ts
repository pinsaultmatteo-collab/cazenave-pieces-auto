import { z } from "zod";

/**
 * Réception des formulaires (contact, enlèvement de véhicule, candidature),
 * en JSON ou en multipart (pièce jointe CV).
 * Envoi par e-mail via Resend si RESEND_API_KEY est renseignée ; sinon le
 * message est journalisé côté serveur (développement).
 */
const optional = z.string().trim().max(200).optional().or(z.literal(""));

const schema = z.object({
  kind: z.enum(["contact", "enlevement", "candidature"]).default("contact"),
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
  message: z.string().trim().max(5000),
  consent: z.literal(true, { error: "Le consentement est requis" }),
  /** Champ piège anti-robots : doit rester vide. */
  website: z.string().max(0).optional().or(z.literal("")),
});

const TO = process.env.CONTACT_TO_EMAIL ?? "contact@cazenave.net";
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Site cazenave.net <no-reply@cazenave.net>";
const CV_MAX_BYTES = 5 * 1024 * 1024;
const CV_TYPES = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

const LABELS: Record<z.infer<typeof schema>["kind"], string> = {
  contact: "Message depuis le site",
  enlevement: "Demande d'enlèvement de véhicule",
  candidature: "Candidature",
};

const PREF_LABELS: Record<string, string> = { telephone: "téléphone", sms: "SMS", email: "e-mail" };

async function readPayload(request: Request): Promise<{ data: unknown; file: File | null }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const fd = await request.formData();
    const data: Record<string, unknown> = {};
    let file: File | null = null;
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        if (key === "cv" && value.size > 0) file = value;
      } else {
        data[key] = value;
      }
    }
    data.consent = fd.get("consent") === "on" || fd.get("consent") === "true";
    return { data, file };
  }
  return { data: await request.json(), file: null };
}

export async function POST(request: Request) {
  let payload: { data: unknown; file: File | null };
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
  if (d.kind !== "enlevement" && d.message.length < 5) {
    return Response.json({ ok: false, error: "Merci de nous écrire quelques mots." }, { status: 422 });
  }

  const file = payload.file;
  if (file && (file.size > CV_MAX_BYTES || !CV_TYPES.has(file.type))) {
    return Response.json({ ok: false, error: "Le CV doit être un PDF ou un document Word de 5 Mo maximum." }, { status: 422 });
  }

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
    file && `Pièce jointe : ${file.name} (${Math.round(file.size / 1024)} Ko)`,
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

  const attachments = file ? [{ filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString("base64") }] : undefined;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: d.email, subject, text, attachments }),
  });
  if (!res.ok) {
    console.error("[contact] échec Resend", res.status, await res.text());
    return Response.json({ ok: false, error: "L'envoi a échoué, merci de réessayer ou de nous appeler" }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}
