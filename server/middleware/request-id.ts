/**
 * Request tracing middleware:
 * - Assigns X-Request-ID for log correlation
 * - Records start time for Server-Timing header (added in onAfterResponse)
 */
export default defineEventHandler((event) => {
  // Request ID
  const existing = getHeader(event, 'x-request-id')
  const requestId = existing || `yf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`
  setHeader(event, 'X-Request-ID', requestId)
  event.context.requestId = requestId

  // Server-Timing: record start time, emit duration on response
  const startMs = performance.now()
  event.context._startMs = startMs

  event.node.res.on('finish', () => {
    // Append Server-Timing header (may already be partially sent for streaming)
    try {
      const dur = (performance.now() - startMs).toFixed(1)
      if (!event.node.res.headersSent) {
        setHeader(event, 'Server-Timing', `total;dur=${dur}`)
      }
    } catch {}
  })
})
