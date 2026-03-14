import { checkRateLimit } from '../utils/rateLimit'

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`health:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)))
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
