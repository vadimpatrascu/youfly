import { enforceRateLimit } from '../utils/rateLimit'

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `health:${ip}`, 30, 60_000)
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
