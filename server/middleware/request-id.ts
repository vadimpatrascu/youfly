/**
 * Adds a unique X-Request-ID header to every API response for log correlation.
 * If the client sends one, it's passed through; otherwise a new one is generated.
 */
export default defineEventHandler((event) => {
  const existing = getHeader(event, 'x-request-id')
  const requestId = existing || `yf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
  setHeader(event, 'X-Request-ID', requestId)

  // Store on event context for use in server routes
  event.context.requestId = requestId
})
