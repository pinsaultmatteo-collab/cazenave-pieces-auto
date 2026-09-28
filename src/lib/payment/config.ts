/**
 * Paiement en ligne disponible ? Vrai si une clé Stripe est configurée, ou
 * hors production (paiement simulé). Module léger, utilisable dans l'en-tête.
 */
export function isPaymentConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY) || process.env.VERCEL_ENV !== "production";
}
