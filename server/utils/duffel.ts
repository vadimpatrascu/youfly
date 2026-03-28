/**
 * Duffel API client with automatic retry for transient errors.
 * Retries on 429 (rate limit) and 5xx (server errors), up to 2 retries.
 */

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function duffelFetch<T>(
  path: string,
  options: Parameters<typeof $fetch>[1] = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const token = config.duffelApiToken

  if (!token) {
    throw createError({ statusCode: 503, message: 'Duffel API not configured' })
  }

  let lastError: any = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await $fetch<T>(`https://api.duffel.com${path}`, {
        ...options,
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

      // Retry on 429 or 5xx
      if (attempt < MAX_RETRIES && (status === 429 || status >= 500)) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt) // Exponential backoff: 1s, 2s
        console.warn(`[Duffel] Retry ${attempt + 1}/${MAX_RETRIES} for ${path} (status ${status}), waiting ${delay}ms`)
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
    // Log full error for debugging, return safe message to client
    console.error('[Duffel] API error:', JSON.stringify(duffelError).substring(0, 500))
    const safeMessage = statusCode === 422 ? (duffelError.message || 'Validation error')
      : statusCode === 404 ? 'Not found'
      : 'Flight service temporarily unavailable'
    throw createError({ statusCode, message: safeMessage })
  }
  console.error('[Duffel] Unknown error:', lastError?.message)
  throw createError({ statusCode, message: 'Flight service temporarily unavailable' })
}
