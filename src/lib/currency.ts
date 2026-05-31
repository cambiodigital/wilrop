/**
 * Formatea un número a moneda colombiana (ej: $1.200.000).
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencySymbol: string = '$',
  locale: string = 'es-CO'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0`
  }
  return `${currencySymbol}${amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}
