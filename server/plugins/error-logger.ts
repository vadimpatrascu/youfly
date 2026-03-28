/**
 * Server-side error logger — captures all unhandled Nitro errors.
 * Outputs structured JSON for Vercel log drains.
 */
import { logger } from '../utils/logger'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, { event }: any) => {
    const status = error?.statusCode || 500

    // Skip 4xx client errors from verbose logging (except rate limits)
    if (status >= 400 && status < 500 && status !== 429) return

    logger.error('Unhandled server error', {
      requestId: event?.context?.requestId || 'no-id',
      statusCode: status,
      url: event?.path || 'unknown',
      method: event?.method || 'unknown',
      errorMessage: error?.message || String(error),
      stack: status >= 500 ? error?.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    })
  })
})
