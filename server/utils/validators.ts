/**
 * Shared input validators for API routes.
 * Centralizes validation logic to prevent inconsistency.
 */

/** Validates email with TLD requirement (min 2 chars) */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim())
}

/** Validates IATA code (3 uppercase alphanumeric characters) */
export function isValidIata(code: unknown): code is string {
  if (typeof code !== 'string') return false
  return /^[A-Z0-9]{3}$/.test(code.toUpperCase())
}

/** Validates date in YYYY-MM-DD format with calendar correctness */
export function isValidDate(date: unknown): date is string {
  if (typeof date !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  // Verify the parsed date matches the input (catches Feb 30, etc.)
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d
}

/** Validates a Duffel-style ID (alphanumeric + hyphens/underscores, max 100 chars) */
export function isValidDuffelId(id: unknown): id is string {
  if (typeof id !== 'string') return false
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id)
}

/** Validates booking reference (4-10 uppercase alphanumeric) */
export function isValidBookingRef(ref: unknown): ref is string {
  if (typeof ref !== 'string') return false
  return /^[A-Z0-9]{4,10}$/.test(ref.toUpperCase())
}

/** Clamps a number to a range. Returns fallback for null/undefined/NaN. */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (value === null || value === undefined) return fallback
  const n = Number(value)
  if (isNaN(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(n)))
}

/** Validates and truncates a string */
export function safeString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().substring(0, maxLength)
}

/** Validates phone number (7-15 digits after stripping non-digits) */
export function isValidPhone(phone: unknown): phone is string {
  if (typeof phone !== 'string') return false
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
