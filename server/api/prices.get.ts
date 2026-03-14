import { checkRateLimit } from '../utils/rateLimit'

// Static price estimates for popular routes from Chisinau
// Used for homepage display without hitting Duffel API

const routePrices: Record<string, { min: number; currency: string; updated: string }> = {
  'RMO-OTP': { min: 35, currency: 'EUR', updated: '2026-03-01' },
  'RMO-IST': { min: 32, currency: 'EUR', updated: '2026-03-01' },
  'RMO-LTN': { min: 39, currency: 'EUR', updated: '2026-03-01' },
  'RMO-VIE': { min: 39, currency: 'EUR', updated: '2026-03-01' },
  'RMO-BCN': { min: 31, currency: 'EUR', updated: '2026-03-01' },
  'RMO-CDG': { min: 73, currency: 'EUR', updated: '2026-03-01' },
  'RMO-MXP': { min: 59, currency: 'EUR', updated: '2026-03-01' },
  'RMO-TLV': { min: 45, currency: 'EUR', updated: '2026-03-01' },
}

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`prices:${ip}`, 60, 60_000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)))
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }

  const query = getQuery(event)
  const route = (query.route as string || '').substring(0, 10).toUpperCase()

  if (route && routePrices[route]) {
    return routePrices[route]
  }

  return routePrices
})
