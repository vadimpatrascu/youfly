import { duffelFetch } from '../utils/duffel'
import { checkRateLimit } from '../utils/rateLimit'

function parseDurationMins(iso: string): number {
  if (!iso) return 0
  const h = iso.match(/(\d+)H/)?.[1] || '0'
  const m = iso.match(/(\d+)M/)?.[1] || '0'
  return parseInt(h) * 60 + parseInt(m)
}

function mapOffer(offer: any) {
  return {
    id: offer.id,
    total_amount: offer.total_amount,
    total_currency: offer.total_currency,
    tax_amount: offer.tax_amount || '0',
    base_amount: offer.base_amount || offer.total_amount,
    expires_at: offer.expires_at,
    passengers: offer.passengers || [],
    slices: (offer.slices || []).map((slice: any) => {
      const segs = slice.segments || []
      return {
        id: slice.id,
        origin: {
          iata_code: slice.origin?.iata_code,
          name: slice.origin?.name,
          city_name: slice.origin?.city?.name || slice.origin?.name,
        },
        destination: {
          iata_code: slice.destination?.iata_code,
          name: slice.destination?.name,
          city_name: slice.destination?.city?.name || slice.destination?.name,
        },
        departing_at: segs[0]?.departing_at,
        arriving_at: segs[segs.length - 1]?.arriving_at,
        duration: slice.duration,
        duration_minutes: parseDurationMins(slice.duration || ''),
        stops: Math.max(0, segs.length - 1),
        segments: segs.map((seg: any) => ({
          id: seg.id,
          departing_at: seg.departing_at,
          arriving_at: seg.arriving_at,
          origin: { iata_code: seg.origin?.iata_code, name: seg.origin?.name },
          destination: { iata_code: seg.destination?.iata_code, name: seg.destination?.name },
          carrier_name: seg.marketing_carrier?.name || seg.operating_carrier?.name || '',
          carrier_iata: seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code || '',
          flight_number: `${seg.marketing_carrier?.iata_code || ''}${seg.marketing_carrier_flight_number || ''}`,
        })),
      }
    }),
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`offers:${ip}`, 20, 60_000)
  if (!rl.allowed) throw createError({ statusCode: 429, message: 'Too many requests' })

  const query = getQuery(event)
  const offerRequestId = query.offer_request_id as string
  if (!offerRequestId) throw createError({ statusCode: 400, message: 'offer_request_id required' })

  try {
    let allOffers: any[] = []
    let after: string | null = null
    let pages = 0
    const maxPages = 3

    // Paginate through results
    do {
      const url = `/air/offer_requests/${offerRequestId}/offers?sort=total_amount&limit=50${after ? `&after=${after}` : ''}`
      const res = await duffelFetch<any>(url)
      const offers = res.data || []
      allOffers = allOffers.concat(offers)
      after = res.meta?.after || null
      pages++
    } while (after && pages < maxPages)

    return allOffers.map(mapOffer)
  } catch (e: any) {
    if (e?.statusCode) throw e
    throw createError({ statusCode: 500, message: e?.message || 'Failed to fetch offers' })
  }
})
