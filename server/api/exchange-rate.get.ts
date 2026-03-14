import { enforceRateLimit } from '../utils/rateLimit'

// Exchange rate endpoint — returns EUR/MDL rate
// In production: fetch from a real exchange rate API
// For demo: use static rate (National Bank of Moldova approx rate)

const STATIC_RATES: Record<string, number> = {
  'EUR-MDL': 19.5,
  'USD-MDL': 18.1,
  'GBP-MDL': 23.2,
  'RON-MDL': 3.9,
  'TRY-MDL': 0.58,
}

export default defineEventHandler((event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `exchange:${ip}`, 60, 60_000)

  const query = getQuery(event)
  const pair = (query.pair as string || 'EUR-MDL').substring(0, 10).toUpperCase()

  return {
    pair,
    rate: STATIC_RATES[pair] ?? null,
    source: 'static',
  }
})
