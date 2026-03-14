import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'
import { mapOffer } from '../utils/mapOffer'

export default defineEventHandler(async (event) => {
  // Rate limit: 20 searches per minute per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `search:${ip}`, 20, 60_000, 'Too many searches. Please wait a minute.')

  const body = await readBody(event)
  const { departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = 'economy' } = body
  // Normalize IATA codes to uppercase immediately so validation and Duffel call are consistent
  const origin = String(body.origin || '').toUpperCase()
  const destination = String(body.destination || '').toUpperCase()

  if (!origin || !destination || !departureDate) {
    throw createError({ statusCode: 400, message: 'Missing required fields: origin, destination, departureDate' })
  }

  // Validate IATA codes (3 uppercase letters/digits) and date format
  const iataRe = /^[A-Z0-9]{3}$/
  if (!iataRe.test(origin) || !iataRe.test(destination)) {
    throw createError({ statusCode: 400, message: 'Invalid airport IATA code' })
  }
  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRe.test(String(departureDate))) {
    throw createError({ statusCode: 400, message: 'Invalid departure date format' })
  }
  if (returnDate && !dateRe.test(String(returnDate))) {
    throw createError({ statusCode: 400, message: 'Invalid return date format' })
  }
  const validCabins = ['economy', 'premium_economy', 'business', 'first']
  if (!validCabins.includes(cabinClass)) {
    throw createError({ statusCode: 400, message: 'Invalid cabin class' })
  }

  // Reject past dates (must be today or future)
  const today = new Date().toISOString().split('T')[0]
  if (String(departureDate) < today) {
    throw createError({ statusCode: 400, message: 'Departure date cannot be in the past' })
  }
  if (returnDate && String(returnDate) < String(departureDate)) {
    throw createError({ statusCode: 400, message: 'Return date cannot be before departure date' })
  }

  // Cap passenger counts to prevent oversized requests
  const adultsN = Math.min(9, Math.max(1, Number(adults) || 1))
  const childrenN = Math.min(9, Math.max(0, Number(children) || 0))
  const infantsN = Math.min(4, Math.max(0, Number(infants) || 0))

  const slices: any[] = [
    { origin, destination, departure_date: departureDate }
  ]
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate })
  }

  const passengers: any[] = [
    ...Array(adultsN).fill({ type: 'adult' }),
    ...Array(childrenN).fill({ type: 'child' }),
    ...Array(infantsN).fill({ type: 'infant_without_seat' }),
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
        adults: adultsN,
        children: childrenN,
        infants: infantsN,
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
