import { enforceRateLimit } from '../utils/rateLimit'
import { logger } from '../utils/logger'

// Exchange rate endpoint — returns X/MDL rates.
// Fetches live ECB-derived rates (open.er-api.com, free, no key) with a
// 6-hour in-memory cache. Falls back to static NBM-approx rates on failure.

const STATIC_RATES: Record<string, number> = {
  'EUR-MDL': 19.5,
  'USD-MDL': 18.1,
  'GBP-MDL': 23.2,
  'RON-MDL': 3.9,
  'TRY-MDL': 0.58,
}

// Live rates cache (per serverless instance)
let liveRates: Record<string, number> | null = null
let liveFetchedAt = 0
let fetchInFlight: Promise<void> | null = null
const LIVE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

async function refreshLiveRates(): Promise<void> {
  try {
    // Base EUR; response: { result: 'success', rates: { MDL: 19.4, USD: 1.08, ... } }
    const res = await $fetch<any>('https://open.er-api.com/v6/latest/EUR', {
      signal: AbortSignal.timeout(5000),
    })
    const rates = res?.rates
    if (res?.result !== 'success' || !rates?.MDL) return
    const mdlPerEur = Number(rates.MDL)
    const next: Record<string, number> = { 'EUR-MDL': round2(mdlPerEur) }
    for (const cur of ['USD', 'GBP', 'RON', 'TRY']) {
      const perEur = Number(rates[cur])
      if (perEur > 0) next[`${cur}-MDL`] = round2(mdlPerEur / perEur)
    }
    liveRates = next
    liveFetchedAt = Date.now()
  } catch (e: any) {
    logger.warn('Exchange rate refresh failed, using fallback', { error: e?.message })
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `exchange:${ip}`, 60, 60_000)

  const query = getQuery(event)
  const pair = (query.pair as string || 'EUR-MDL').substring(0, 10).toUpperCase()

  // Refresh live rates if stale (deduplicate concurrent refreshes)
  if (!liveRates || Date.now() - liveFetchedAt > LIVE_TTL_MS) {
    if (!fetchInFlight) {
      fetchInFlight = refreshLiveRates().finally(() => { fetchInFlight = null })
    }
    // Only block the request if we have no rates at all; otherwise serve stale
    if (!liveRates) await fetchInFlight
  }

  const source = liveRates?.[pair] != null ? 'live' : 'static'
  const rate = liveRates?.[pair] ?? STATIC_RATES[pair] ?? null

  setHeader(event, 'Cache-Control', 'public, max-age=1800, s-maxage=3600')

  return { pair, rate, source }
})
