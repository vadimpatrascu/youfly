/**
 * Duffel API client with automatic retry for transient errors.
 * Retries on 429 (rate limit) and 5xx (server errors), up to 2 retries.
 */
import { logger } from './logger'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000
const REQUEST_TIMEOUT_MS = 30_000 // 30s per request (Duffel search can be slow)

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @param retryOverride Set to 0 for NON-IDEMPOTENT calls (order creation,
 * payment confirmation): a retry after an ambiguous 5xx/timeout could
 * double-book or double-confirm.
 */
export async function duffelFetch<T>(
  path: string,
  options: Parameters<typeof $fetch>[1] = {},
  retryOverride?: number
): Promise<T> {
  const config = useRuntimeConfig()
  const token = config.duffelApiToken
  // Overridable for staging/integration tests (NUXT_DUFFEL_API_BASE)
  const apiBase = (config as any).duffelApiBase || 'https://api.duffel.com'

  if (!token) {
    throw createError({ statusCode: 503, message: 'Duffel API not configured' })
  }

  let lastError: any = null
  const startedAt = Date.now()
  const TOTAL_BUDGET_MS = 45_000 // don't start a retry if we'd likely exceed the function budget
  const maxRetries = retryOverride ?? MAX_RETRIES

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await $fetch<T>(`${apiBase}${path}`, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${token}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers as Record<string, string> || {}),
        },
      })
    } catch (e: any) {
      lastError = e
      const status = e?.statusCode || e?.status || 0

      // Don't retry client errors (4xx) except 429 (rate limit)
      if (status >= 400 && status < 500 && status !== 429) {
        break
      }

      // Retry on 429, 5xx, or transport failures (timeout/abort/network — no HTTP status)
      if (attempt < maxRetries && (status === 429 || status >= 500 || status === 0) && Date.now() - startedAt < TOTAL_BUDGET_MS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt) // Exponential backoff: 1s, 2s
        logger.warn('Duffel retry', { attempt: attempt + 1, maxRetries, path, status, delayMs: delay })
        await sleep(delay)
        continue
      }

      break
    }
  }

  // Re-throw with safe message — never expose raw Duffel internals to client
  const duffelError = lastError?.data?.errors?.[0]
  const statusCode = lastError?.statusCode || 500
  if (duffelError) {
    logger.error('Duffel API error', { statusCode, errorCode: duffelError.code, errorTitle: duffelError.title, path: 'redacted' })
    const safeMessage = statusCode === 422 ? (duffelError.message || 'Validation error')
      : statusCode === 404 ? 'Not found'
      : 'Flight service temporarily unavailable'
    throw createError({ statusCode, message: safeMessage })
  }
  logger.error('Duffel unknown error', { statusCode, errorMessage: lastError?.message })
  throw createError({ statusCode, message: 'Flight service temporarily unavailable' })
}
