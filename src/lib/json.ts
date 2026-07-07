/**
 * Parsea una cadena JSON de forma segura, retornando un valor por defecto si falla.
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/**
 * Parse a string list stored either as JSON array or legacy comma-separated text.
 */
export function parseStringList(
  value: string | string[] | null | undefined,
): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean)
    }
  } catch {
    // Legacy comma-separated format fallback.
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
