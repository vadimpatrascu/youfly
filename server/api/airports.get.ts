import { duffelFetch } from '../utils/duffel'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').trim()
  if (q.length < 2) return []

  try {
    const res = await duffelFetch<any>(`/air/airports?query=${encodeURIComponent(q)}&limit=10`)
    return (res.data || []).map((a: any) => ({
      iata_code: a.iata_country_code || a.iata_code,
      airport_iata: a.iata_code,
      name: a.name,
      city_name: a.city?.name || a.city_name || a.name,
      country_code: a.iata_country_code,
      type: a.type,
    }))
  } catch (e: any) {
    console.error('Airport search error:', e?.message)
    return []
  }
})
