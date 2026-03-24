/**
 * Server-side error logger — captures all unhandled Nitro errors.
 * Logs structured errors visible in Vercel runtime logs.
 * In production, replace with Sentry SDK integration.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, { event }: any) => {
    console.error('[YouFly Server Error]', {
      message: error?.message || String(error),
      statusCode: error?.statusCode || 500,
      url: event?.path || 'unknown',
      method: event?.method || 'unknown',
      timestamp: new Date().toISOString(),
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
    })
  })
})
