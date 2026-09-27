import { z } from "zod";

/** Données saisies dans le tunnel de commande (validées côté client et serveur). */
export const addressSchema = z.object({
  firstname: z.string().trim().min(2, "Prénom requis").max(60),
  lastname: z.string().trim().min(2, "Nom requis").max(60),
  company: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^(\+33|0)[1-9](?:[ .-]?\d{2}){4}$/, "Numéro de téléphone français attendu"),
  street: z.string().trim().min(3, "Adresse requise").max(120),
  streetAdditional: z.string().trim().max(120).optional().or(z.literal("")),
  postcode: z.string().trim().regex(/^\d{5}$/, "Code postal à 5 chiffres"),
  city: z.string().trim().min(2, "Ville requise").max(80),
  country: z.literal("FR").default("FR"),
});

export const checkoutSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(120),
  items: z.array(z.number().int().positive()).min(1, "Panier vide").max(20),
  deliveryMode: z.enum(["pickup", "shipping"]),
  billing: addressSchema,
  /** Adresse de livraison distincte (sinon = facturation) */
  shipToBilling: z.boolean().default(true),
  delivery: addressSchema.optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  acceptCgv: z.literal(true, { message: "Vous devez accepter les conditions générales de vente" }),
  /** Champ piège anti-robots, doit rester vide */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;
