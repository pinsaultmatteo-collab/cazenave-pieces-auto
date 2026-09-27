import "server-only";
import { randomBytes } from "node:crypto";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { parts, type OrderAddress, type OrderItem, type OrderRow } from "@/db/schema";
import { casseId, createClient, createOrder, findClientsByEmail, getOrder, updatePayment } from "@/lib/opisto/client";
import { OPISTO_PAYMENT_CB, type OpistoOrderAddress } from "@/lib/opisto/types";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { ORDERS_TO, sendEmail } from "@/lib/email";
import { getOrderByRef, updateOrder } from "./checkout";

/** Identifiant Opisto de la France (référentiel /geography/countries). */
const COUNTRY_FR = 0;

export type PaymentInfo = { provider: string; sessionId?: string | null; paymentIntentId: string; amount?: number };

/**
 * Après paiement confirmé : enregistre la commande chez Opisto (client,
 * commande avec réservation des pièces, règlement CB), puis envoie les
 * e-mails. Idempotent : un second appel pour une commande déjà traitée ne
 * fait rien.
 */
export async function fulfillOrder(ref: string, payment: PaymentInfo): Promise<OrderRow> {
  let order = await getOrderByRef(ref);
  if (!order) throw new Error(`Commande ${ref} introuvable`);
  if (order.status === "completed") return order;

  if (order.status === "pending" || order.status === "cancelled") {
    order = await updateOrder(order.id, {
      status: "paid",
      paidAt: new Date(),
      paymentProvider: payment.provider,
      paymentSessionId: payment.sessionId ?? order.paymentSessionId,
      paymentIntentId: payment.paymentIntentId,
    });
  }

  if (process.env.ORDERS_DRY_RUN === "1") {
    order = await updateOrder(order.id, { status: "completed", opistoError: "ORDERS_DRY_RUN : commande non transmise à Opisto" });
    await sendOrderEmails(order);
    return order;
  }

  try {
    const clientId = order.opistoClientId ?? (await ensureOpistoClient(order));
    if (!order.opistoClientId) order = await updateOrder(order.id, { opistoClientId: clientId });

    if (!order.opistoOrderId) {
      const result = await createOrder(buildOrderDto(order, clientId));
      if (!result.OrderId) {
        const parts = result.PartsWithError?.length ? ` (pièces : ${result.PartsWithError.join(", ")})` : "";
        throw new Error(`Opisto a refusé la commande : ${result.ErrorMessage ?? "erreur"} [code ${result.ErrorCode ?? "?"}]${parts}`);
      }
      order = await updateOrder(order.id, { opistoOrderId: result.OrderId, opistoPaymentId: result.PaymentId ?? null });
      await reserveLocally(order.items.map((i) => i.id));
    }

    if (order.opistoOrderId && order.opistoPaymentId) {
      await updatePayment(order.opistoOrderId, order.opistoPaymentId, {
        Amount: Number(order.totalTtc),
        TransactionNumber: payment.paymentIntentId,
        TypePayment: OPISTO_PAYMENT_CB,
      });
    }

    // Contrôle : le total calculé par Opisto doit correspondre au montant encaissé.
    let warning: string | null = null;
    if (order.opistoOrderId) {
      try {
        const remote = await getOrder(order.opistoOrderId);
        if (typeof remote.Total === "number" && Math.abs(remote.Total - Number(order.totalTtc)) > 0.01) {
          warning = `Écart de montant : encaissé ${order.totalTtc} €, total Opisto ${remote.Total} €`;
        }
      } catch (err) {
        warning = `Relecture de la commande Opisto impossible : ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    order = await updateOrder(order.id, { status: "completed", opistoError: warning });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[commande ${ref}] échec Opisto :`, message);
    order = await updateOrder(order.id, { status: "opisto_failed", opistoError: message.slice(0, 2000) });
  }

  await sendOrderEmails(order);
  return order;
}

/** Retire immédiatement les pièces vendues du catalogue local (la synchronisation confirmera). */
async function reserveLocally(ids: number[]) {
  if (!ids.length) return;
  const db = await getDb();
  await db.update(parts).set({ available: false, inStock: false, syncedAt: new Date() }).where(inArray(parts.id, ids));
}

/** Retrouve le client Opisto par e-mail, ou le crée. */
async function ensureOpistoClient(order: OrderRow): Promise<number> {
  const existing = await findClientsByEmail(order.email).catch(() => []);
  if (existing[0]) return existing[0].Id;
  try {
    return await createClient({
      email: order.email,
      firstname: order.customer.firstname,
      lastname: order.customer.lastname,
      password: randomBytes(12).toString("base64url"),
    });
  } catch (err) {
    // Le client existe peut-être déjà (code -100) : seconde recherche.
    const again = await findClientsByEmail(order.email).catch(() => []);
    if (again[0]) return again[0].Id;
    throw err;
  }
}

function toOpistoAddress(a: OrderAddress, email: string): OpistoOrderAddress {
  return {
    Firstname: a.firstname,
    Lastname: a.lastname,
    Phone: a.phone,
    Street: a.company ? `${a.company}, ${a.street}` : a.street,
    StreetAdditionnal: a.streetAdditional ?? "",
    PostCode: a.postcode,
    City: a.city,
    CountryId: COUNTRY_FR,
    Email: email,
  };
}

function buildOrderDto(order: OrderRow, clientId: number) {
  const ship = order.deliveryMode === "shipping";
  return {
    CasseId: casseId(),
    ClientId: clientId,
    BillingAddress: toOpistoAddress(order.billing, order.email),
    DeliveryAddress: ship && order.delivery ? toOpistoAddress(order.delivery, order.email) : undefined,
    Parts: order.items.map((i: OrderItem) => ({ Id: i.id, ShippingId: ship ? (i.shippingId ?? undefined) : undefined, Discount: 0 })),
    ToSend: ship,
    IsFreeShipping: false,
  };
}

/* ---------- e-mails ---------- */

function itemLines(items: OrderItem[]) {
  return items.map((i) => `- ${i.name} ${[i.brandName, i.modelName].filter(Boolean).join(" ")}${i.reference ? ` (réf. ${i.reference})` : ""} · ${formatPrice(i.priceTtc)}`).join("\n");
}

export async function sendOrderEmails(order: OrderRow) {
  const ship = order.deliveryMode === "shipping";
  const addr = (a: OrderAddress) => `${a.firstname} ${a.lastname}${a.company ? ` (${a.company})` : ""}\n${a.street}${a.streetAdditional ? `\n${a.streetAdditional}` : ""}\n${a.postcode} ${a.city}\n${a.phone}`;
  const summary = [
    `Commande ${order.ref}`,
    "",
    itemLines(order.items),
    "",
    `Pièces : ${formatPrice(Number(order.subtotalTtc))}`,
    ship ? `Livraison : ${formatPrice(Number(order.shippingTtc))}` : "Retrait au comptoir de Colomiers : gratuit",
    `Total TTC réglé : ${formatPrice(Number(order.totalTtc))}`,
    "",
    ship ? `Adresse de livraison :\n${addr(order.delivery ?? order.billing)}` : `Retrait : ${site.address.street}, ${site.address.postcode} ${site.address.city}\n${site.hours}`,
  ].join("\n");

  if (!order.customerEmailSentAt) {
    const customerText = [
      `Bonjour ${order.customer.firstname},`,
      "",
      "Merci pour votre commande, votre paiement a bien été reçu.",
      ship ? "Nous préparons vos pièces : expédition sous 24 à 48 h ouvrées, vous recevrez le numéro de suivi par e-mail." : "Vos pièces sont mises de côté : présentez cette référence au comptoir pour les retirer.",
      "",
      summary,
      "",
      `Une question ? ${site.phone} ou par SMS au ${site.sms}.`,
      `${site.name}`,
    ].join("\n");
    const sent = await sendEmail({ to: order.email, subject: `Votre commande ${order.ref} est confirmée`, text: customerText, replyTo: ORDERS_TO });
    if (sent.delivered) await updateOrder(order.id, { customerEmailSentAt: new Date() });
  }

  const status =
    order.status === "completed"
      ? `Enregistrée chez Opisto : commande n° ${order.opistoOrderId}, règlement n° ${order.opistoPaymentId}${order.opistoError ? `\nAttention : ${order.opistoError}` : ""}`
      : `NON ENREGISTRÉE CHEZ OPISTO, à saisir à la main.\nErreur : ${order.opistoError ?? "inconnue"}`;
  await sendEmail({
    to: ORDERS_TO,
    subject: `${order.status === "completed" ? "Nouvelle commande" : "Commande payée à traiter"} ${order.ref} · ${formatPrice(Number(order.totalTtc))}`,
    text: [status, "", `Client : ${order.customer.firstname} ${order.customer.lastname} · ${order.email} · ${order.customer.phone}`, order.note ? `Note du client : ${order.note}` : "", "", summary, "", `Paiement ${order.paymentProvider} : ${order.paymentIntentId ?? "-"}`].join("\n"),
    replyTo: order.email,
  });
}
