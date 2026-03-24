/**
 * Simple HTML entity escaping to prevent stored XSS.
 * Applied to user-submitted text before storing in database.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Sanitize a string: trim, limit length, escape HTML entities.
 */
export function sanitizeInput(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return escapeHtml(value.trim().substring(0, maxLength))
}
