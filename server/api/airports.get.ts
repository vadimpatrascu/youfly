import { duffelFetch } from '../utils/duffel'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').trim()
  if (q.length < 2) return []

  try {
    const res = await duffelFetch<any>(`/air/airports?query=${encodeURIComponent(q)}&limit=10`)
    const airports = res.data || []

    return airports.map((a: any) => ({
      iata_code: a.iata_country_code || a.iata_code,
      airport_iata: a.iata_code,
      name: a.name,
      city_name: a.city?.name || a.city_name || a.name,
      country_code: a.iata_country_code,
      type: a.type,
    })).filter((a: any) => a.airport_iata) // only airports with valid IATA codes
  } catch (e: any) {
    console.error('Airport search error:', e?.message, JSON.stringify(e?.data || {}))
    return []
  }
})
