/**
 * Server-side error logger — captures all unhandled Nitro errors.
 * Logs structured errors visible in Vercel runtime logs.
 * In production, replace with Sentry SDK integration.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, { event }: any) => {
    // Skip 4xx client errors from verbose logging
    const status = error?.statusCode || 500
    if (status >= 400 && status < 500 && status !== 429) return

    console.error('[YouFly Server Error]', {
      requestId: event?.context?.requestId || 'no-id',
      message: error?.message || String(error),
      statusCode: status,
      url: event?.path || 'unknown',
      method: event?.method || 'unknown',
      ip: event ? (getRequestIP(event, { xForwardedFor: true }) || 'unknown') : 'unknown',
      timestamp: new Date().toISOString(),
      stack: status >= 500 ? error?.stack?.split('\n').slice(0, 3).join(' | ') : undefined,
    })
  })
})
