import { duffelFetch } from '../utils/duffel'
import { checkRateLimit } from '../utils/rateLimit'

// Simple in-memory cache: query -> { results, ts }
const airportCache = new Map<string, { results: any[]; ts: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const MAX_CACHE_SIZE = 500

function pruneCache() {
  if (airportCache.size < MAX_CACHE_SIZE) return
  const now = Date.now()
  for (const [key, entry] of airportCache) {
    if (now - entry.ts > CACHE_TTL) airportCache.delete(key)
  }
  // If still too large, remove oldest entries
  if (airportCache.size >= MAX_CACHE_SIZE) {
    const firstKey = airportCache.keys().next().value
    if (firstKey) airportCache.delete(firstKey)
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`airports:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)))
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }

  const query = getQuery(event)
  const q = (query.q as string || '').trim().toLowerCase().substring(0, 50)
  if (q.length < 2) return []

  const cached = airportCache.get(q)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.results
  }

  try {
    // Use /places/suggestions — the correct Duffel endpoint for autocomplete
    const res = await duffelFetch<any>(`/places/suggestions?query=${encodeURIComponent(q)}`)
    const places = res.data || []

    const results: any[] = []
    const seen = new Set<string>()

    for (const place of places) {
      // If it's a city with airports, add the city first (shows as "London (LON)")
      if (place.type === 'city' && place.airports?.length) {
        const key = place.iata_code
        if (!seen.has(key)) {
          seen.add(key)
          results.push({
            iata_code: place.iata_country_code,
            airport_iata: place.iata_code, // city code like LON, PAR
            name: `All airports`,
            city_name: place.name,
            country_code: place.iata_country_code,
            type: 'city',
            is_city: true,
          })
        }
        // Then add individual airports of that city
        for (const ap of place.airports.slice(0, 3)) {
          if (!seen.has(ap.iata_code)) {
            seen.add(ap.iata_code)
            results.push({
              iata_code: ap.iata_country_code,
              airport_iata: ap.iata_code,
              name: ap.name,
              city_name: ap.city_name || place.name,
              country_code: ap.iata_country_code,
              type: 'airport',
            })
          }
        }
      } else if (place.type === 'airport' && place.iata_code) {
        if (!seen.has(place.iata_code)) {
          seen.add(place.iata_code)
          results.push({
            iata_code: place.iata_country_code,
            airport_iata: place.iata_code,
            name: place.name,
            city_name: place.city_name || place.city?.name || place.name,
            country_code: place.iata_country_code,
            type: 'airport',
          })
        }
      }
      if (results.length >= 8) break
    }

    pruneCache()
    airportCache.set(q, { results, ts: Date.now() })
    return results
  } catch (e: any) {
    console.error('Airport search error:', e?.message, JSON.stringify(e?.data || {}))
    return []
  }
})
