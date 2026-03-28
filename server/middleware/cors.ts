/**
 * CORS middleware for API routes.
 * - Allows same-origin requests (no Origin or matching Origin)
 * - Blocks cross-origin POST/PUT/PATCH/DELETE to /api/* routes
 * - Allows GET requests from any origin (public read APIs)
 * - Handles preflight OPTIONS requests
 */
export default defineEventHandler((event) => {
  const url = event.path || ''

  // Only apply to API routes
  if (!url.startsWith('/api/')) return

  const origin = getHeader(event, 'origin')
  const host = getHeader(event, 'host')

  // Handle preflight
  if (event.method === 'OPTIONS') {
    setHeader(event, 'Access-Control-Allow-Origin', origin || '*')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
    setHeader(event, 'Access-Control-Max-Age', '86400')
    return ''
  }

  // For mutation methods, verify origin matches host (same-origin check)
  const method = event.method?.toUpperCase()
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    if (origin) {
      try {
        const originHost = new URL(origin).host
        if (host && originHost !== host) {
          throw createError({ statusCode: 403, message: 'Cross-origin request blocked' })
        }
      } catch (e: any) {
        if (e?.statusCode === 403) throw e
        // Malformed origin header — block
        throw createError({ statusCode: 403, message: 'Invalid origin' })
      }
    }
  }

  // Set CORS headers for allowed requests
  if (origin) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Vary', 'Origin')
  }
})
