/**
 * Simple in-memory rate limiter for Nitro server routes.
 * Resets on server restart — good enough for Vercel serverless.
 */

const ipMap = new Map<string, { count: number; resetAt: number }>()

// Periodically prune expired entries to prevent unbounded memory growth
let lastPruneAt = Date.now()
const PRUNE_INTERVAL_MS = 5 * 60_000 // prune every 5 minutes

function maybePrune() {
  const now = Date.now()
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return
  lastPruneAt = now
  for (const [key, entry] of ipMap) {
    if (now > entry.resetAt) ipMap.delete(key)
  }
}

export function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  maybePrune()
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    ipMap.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Check rate limit and throw 429 with Retry-After header if exceeded.
 * Returns the remaining count on success.
 */
export function enforceRateLimit(
  event: Parameters<typeof setHeader>[0],
  key: string,
  maxRequests: number,
  windowMs: number,
  message = 'Too many requests. Please try again later.'
): void {
  const rl = checkRateLimit(key, maxRequests, windowMs)
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000)
    setHeader(event, 'Retry-After', String(retryAfter))
    throw createError({ statusCode: 429, message })
  }
}
