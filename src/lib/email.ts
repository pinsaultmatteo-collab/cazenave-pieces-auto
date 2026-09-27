import "server-only";

/**
 * Envoi d'e-mails transactionnels via Resend (RESEND_API_KEY). Sans clé,
 * le message est journalisé et la fonction renvoie `delivered: false`.
 */
export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export const EMAIL_FROM = process.env.CONTACT_FROM_EMAIL ?? "Cazenave Pièces Auto <no-reply@cazenave.net>";
export const ORDERS_TO = process.env.ORDERS_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? "contact@cazenave.net";

export async function sendEmail(message: EmailMessage): Promise<{ delivered: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = Array.isArray(message.to) ? message.to : [message.to];
  if (!key) {
    console.info(`[email] RESEND_API_KEY absente, message non envoyé à ${to.join(", ")} : ${message.subject}\n${message.text}`);
    return { delivered: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EMAIL_FROM, to, reply_to: message.replyTo, subject: message.subject, text: message.text, html: message.html }),
  });
  if (!res.ok) {
    const error = await res.text();
    console.error("[email] échec Resend", res.status, error);
    return { delivered: false, error };
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string };
  return { delivered: true, id: json.id };
}
