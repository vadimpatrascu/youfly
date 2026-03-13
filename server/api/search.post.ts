import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'

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
          city_name: slice.origin?.city?.name || slice.origin?.city_name || slice.origin?.name,
        },
        destination: {
          iata_code: slice.destination?.iata_code,
          name: slice.destination?.name,
          city_name: slice.destination?.city?.name || slice.destination?.city_name || slice.destination?.name,
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
  const body = await readBody(event)
  const { origin, destination, departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = 'economy' } = body

  if (!origin || !destination || !departureDate) {
    throw createError({ statusCode: 400, message: 'Missing required fields: origin, destination, departureDate' })
  }

  const slices: any[] = [
    { origin, destination, departure_date: departureDate }
  ]
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate })
  }

  const passengers: any[] = [
    ...Array(Math.max(1, Number(adults))).fill({ type: 'adult' }),
    ...Array(Math.max(0, Number(children))).fill({ type: 'child' }),
    ...Array(Math.max(0, Number(infants))).fill({ type: 'infant_without_seat' }),
  ]

  try {
    // Use return_offers: true to get offers inline (works on all Duffel plans)
    const res = await duffelFetch<any>('/air/offer_requests', {
      method: 'POST',
      body: {
        data: {
          slices,
          passengers,
          cabin_class: cabinClass,
          return_offers: true,
          max_connections: 2,
        }
      }
    })

    const offerRequest = res.data
    const offerRequestId = offerRequest?.id
    const rawOffers = offerRequest?.offers || []

    if (!offerRequestId) {
      console.error('No offer request ID:', JSON.stringify(res).slice(0, 500))
      throw createError({ statusCode: 500, message: 'No offer request ID returned from Duffel' })
    }

    // Map offers to simplified format
    const offers = rawOffers.map(mapOffer)

    // Fire-and-forget lead save
    const supabase = createServerSupabase()
    if (supabase) {
      supabase.from('leads').insert({
        from_iata: origin,
        to_iata: destination,
        depart_date: departureDate,
        return_date: returnDate || null,
        adults: Number(adults),
        children: Number(children),
        infants: Number(infants),
        cabin_class: cabinClass,
      }).then(() => {}).catch((e: any) => console.error('Lead insert error:', e.message))
    }

    return { offerRequestId, offers }
  } catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Search error:', e?.message, JSON.stringify(e?.data || {}).slice(0, 500))
    const msg = e?.data?.errors?.[0]?.message || e?.message || 'Search failed'
    throw createError({ statusCode: 500, message: msg })
  }
})
