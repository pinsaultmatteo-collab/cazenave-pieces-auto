import { z } from "zod";

/**
 * Réception des formulaires (contact, enlèvement de véhicule, candidature).
 * Envoi par e-mail via Resend si RESEND_API_KEY est renseignée ; sinon le
 * message est journalisé côté serveur (développement).
 */
const schema = z.object({
  kind: z.enum(["contact", "enlevement", "candidature"]).default("contact"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  plate: z.string().trim().max(20).optional().or(z.literal("")),
  vehicle: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(160).optional().or(z.literal("")),
  rolling: z.string().trim().max(10).optional().or(z.literal("")),
  accessible: z.string().trim().max(10).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(5000),
  consent: z.literal(true, { error: "Le consentement est requis" }),
  /** Champ piège anti-robots : doit rester vide. */
  website: z.string().max(0).optional().or(z.literal("")),
});

const TO = process.env.CONTACT_TO_EMAIL ?? "contact@cazenave.net";
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Site cazenave.net <no-reply@cazenave.net>";

const LABELS: Record<z.infer<typeof schema>["kind"], string> = {
  contact: "Message depuis le site",
  enlevement: "Demande d'enlèvement de véhicule",
  candidature: "Candidature spontanée",
};

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Requête invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Merci de vérifier les champs du formulaire." }, { status: 422 });
  }
  const d = parsed.data;

  const lines = [
    `Type : ${LABELS[d.kind]}`,
    `Nom : ${d.name}`,
    `E-mail : ${d.email}`,
    d.phone && `Téléphone : ${d.phone}`,
    d.subject && `Sujet : ${d.subject}`,
    d.plate && `Immatriculation : ${d.plate}`,
    d.vehicle && `Véhicule : ${d.vehicle}`,
    d.city && `Lieu : ${d.city}`,
    d.rolling && `Véhicule roulant : ${d.rolling}`,
    d.accessible && `Accessible à la dépanneuse : ${d.accessible}`,
    "",
    d.message,
  ].filter((l): l is string => typeof l === "string");
  const text = lines.join("\n");
  const subject = `[cazenave.net] ${LABELS[d.kind]}${d.subject ? ` · ${d.subject}` : ""} · ${d.name}`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[contact] RESEND_API_KEY absente, message non envoyé :\n" + text);
    return Response.json({ ok: true, delivered: false });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: d.email, subject, text }),
  });
  if (!res.ok) {
    console.error("[contact] échec Resend", res.status, await res.text());
    return Response.json({ ok: false, error: "L'envoi a échoué, merci de réessayer ou de nous appeler." }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}
