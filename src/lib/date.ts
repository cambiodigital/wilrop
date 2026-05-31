/**
 * Convierte un valor de fecha a objeto Date de forma segura.
 */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formatea una fecha en formato corto (ej: "31 may 2026").
 */
export function formatDateShort(
  date: Date | string | number | null | undefined,
  locale: string = 'es-CO'
): string {
  const d = toDate(date)
  if (!d) return 'N/A'
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha en formato largo (ej: "31 de mayo de 2026").
 */
export function formatDateLong(
  date: Date | string | number | null | undefined,
  locale: string = 'es-CO'
): string {
  const d = toDate(date)
  if (!d) return 'N/A'
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha y hora completa (ej: "31 may 2026, 19:20").
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  locale: string = 'es-CO'
): string {
  const d = toDate(date)
  if (!d) return 'N/A'
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
