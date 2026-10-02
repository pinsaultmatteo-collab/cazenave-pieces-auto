/** Prix professionnel : prix public moins la remise, arrondi au centime (partagé client et serveur). */
export function proPrice(price: number, rate: number): number {
  return rate > 0 ? Math.round(price * (1 - rate) * 100) / 100 : price;
}

/** Compte tel qu'exposé au navigateur. */
export type PublicAccount = {
  email: string;
  firstname: string | null;
  company: string | null;
  isPro: boolean;
  /** Remise appliquée aux pièces (0,2 = -20 %), 0 pour un particulier */
  discountRate: number;
};
