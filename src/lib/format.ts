const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
const num = new Intl.NumberFormat("fr-FR");
const dateLong = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const monthYear = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function formatPrice(value: number): string {
  return eur.format(value);
}

export function formatNumber(value: number): string {
  return num.format(value);
}

export function formatDate(iso: string): string {
  return dateLong.format(new Date(iso));
}

export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(iso));
}

export function formatMileage(km: number): string {
  return `${num.format(km)} km`;
}
