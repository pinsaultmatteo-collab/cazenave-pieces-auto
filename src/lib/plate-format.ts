/**
 * Format des plaques françaises, partagé par le formulaire et le serveur.
 * « ab 123 cd » → « AB-123-CD » (SIV) ; anciennes plaques FNI
 * (« 123 ABC 31 ») gardées sans séparateurs. null si non reconnue.
 */
export function normalizePlate(input: string): string | null {
  const v = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const siv = /^([A-Z]{2})(\d{3})([A-Z]{2})$/.exec(v);
  if (siv) return `${siv[1]}-${siv[2]}-${siv[3]}`;
  if (/^\d{1,4}[A-Z]{1,3}(\d{2}|2A|2B|97\d)$/.test(v)) return v;
  return null;
}
