import { duffelFetch } from '../utils/duffel'

function parseDuration(iso: string): number {
  // PT2H30M → minutes
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return 0
  return (parseInt(m[1] || '0') * 60) + parseInt(m[2] || '0')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const offerRequestId = query.offer_request_id as string
  if (!offerRequestId) throw createError({ statusCode: 400, message: 'offer_request_id required' })

  try {
    const res = await duffelFetch<any>(`/air/offer_requests/${offerRequestId}/offers?limit=100&sort=total_amount`)

    return (res.data || []).map((offer: any) => ({
      id: offer.id,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      tax_amount: offer.tax_amount,
      base_amount: offer.base_amount,
      expires_at: offer.expires_at,
      passengers: offer.passengers, // needed for booking (IDs)
      slices: offer.slices.map((slice: any) => ({
        id: slice.id,
        origin: { iata_code: slice.origin?.iata_code, name: slice.origin?.name, city_name: slice.origin?.city?.name || slice.origin?.name },
        destination: { iata_code: slice.destination?.iata_code, name: slice.destination?.name, city_name: slice.destination?.city?.name || slice.destination?.name },
        departing_at: slice.segments?.[0]?.departing_at,
        arriving_at: slice.segments?.[slice.segments.length - 1]?.arriving_at,
        duration: slice.duration,
        duration_minutes: parseDuration(slice.duration || 'PT0M'),
        stops: slice.segments?.length - 1,
        segments: slice.segments?.map((seg: any) => ({
          id: seg.id,
          departing_at: seg.departing_at,
          arriving_at: seg.arriving_at,
          origin: { iata_code: seg.origin?.iata_code, name: seg.origin?.name },
          destination: { iata_code: seg.destination?.iata_code, name: seg.destination?.name },
          carrier_name: seg.marketing_carrier?.name,
          carrier_iata: seg.marketing_carrier?.iata_code,
          flight_number: `${seg.marketing_carrier?.iata_code}${seg.marketing_carrier_flight_number}`,
          aircraft: seg.aircraft?.name,
        }))
      }))
    }))
  } catch (e: any) {
    console.error('Offers error:', e?.message)
    throw createError({ statusCode: 500, message: e?.message || 'Failed to fetch offers' })
  }
})
