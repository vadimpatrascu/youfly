/**
 * Reject oversized request bodies to prevent abuse.
 * Only applies to POST/PUT/PATCH methods with Content-Length header.
 * Max 100KB for API routes.
 */
const MAX_BODY_BYTES = 100 * 1024 // 100KB

export default defineEventHandler((event) => {
  const method = event.method?.toUpperCase()
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') return

  const contentLength = getHeader(event, 'content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, message: 'Request body too large' })
  }
})
