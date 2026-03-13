import { duffelFetch } from '../utils/duffel'

function parseDuration(iso: string): number {
  if (!iso) return 0
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return 0
  return (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const offerRequestId = query.offer_request_id as string
  if (!offerRequestId) throw createError({ statusCode: 400, message: 'offer_request_id required' })

  try {
    // Fetch offers - Duffel returns up to 200 offers per page
    const res = await duffelFetch<any>(`/air/offer_requests/${offerRequestId}/offers?sort=total_amount&limit=200`)
    const offers = res.data || []

    return offers.map((offer: any) => ({
      id: offer.id,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      tax_amount: offer.tax_amount || '0',
      base_amount: offer.base_amount || offer.total_amount,
      expires_at: offer.expires_at,
      passengers: offer.passengers || [],
      slices: (offer.slices || []).map((slice: any) => {
        const segments = slice.segments || []
        const firstSeg = segments[0] || {}
        const lastSeg = segments[segments.length - 1] || {}
        return {
          id: slice.id,
          origin: {
            iata_code: slice.origin?.iata_code,
            name: slice.origin?.name,
            city_name: slice.origin?.city?.name || slice.origin?.city_name || slice.origin?.name,
          },
          destination: {
            iata_code: slice.destination?.iata_code,
            name: slice.destination?.name,
            city_name: slice.destination?.city?.name || slice.destination?.city_name || slice.destination?.name,
          },
          departing_at: firstSeg.departing_at,
          arriving_at: lastSeg.arriving_at,
          duration: slice.duration,
          duration_minutes: parseDuration(slice.duration || ''),
          stops: Math.max(0, segments.length - 1),
          segments: segments.map((seg: any) => ({
            id: seg.id,
            departing_at: seg.departing_at,
            arriving_at: seg.arriving_at,
            origin: { iata_code: seg.origin?.iata_code, name: seg.origin?.name },
            destination: { iata_code: seg.destination?.iata_code, name: seg.destination?.name },
            carrier_name: seg.marketing_carrier?.name || seg.operating_carrier?.name,
            carrier_iata: seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code,
            flight_number: `${seg.marketing_carrier?.iata_code || ''}${seg.marketing_carrier_flight_number || ''}`,
            aircraft: seg.aircraft?.name,
          })),
        }
      }),
    }))
  } catch (e: any) {
    console.error('Offers fetch error:', e?.message, JSON.stringify(e?.data || {}))
    throw createError({ statusCode: e?.statusCode || 500, message: e?.data?.errors?.[0]?.message || e?.message || 'Failed to fetch offers' })
  }
})
