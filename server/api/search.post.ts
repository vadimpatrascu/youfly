import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'
import { mapOffer } from '../utils/mapOffer'
import { isValidIata, isValidDate, clampInt } from '../utils/validators'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `search:${ip}`, 20, 60_000, 'Too many searches. Please wait a minute.')

  const body = await readBody(event)
  const { departureDate, returnDate, cabinClass = 'economy' } = body
  const origin = String(body.origin || '').toUpperCase()
  const destination = String(body.destination || '').toUpperCase()

  if (!isValidIata(origin) || !isValidIata(destination)) {
    throw createError({ statusCode: 400, message: 'Invalid airport IATA code' })
  }
  if (!isValidDate(departureDate)) {
    throw createError({ statusCode: 400, message: 'Invalid departure date format' })
  }
  if (returnDate && !isValidDate(returnDate)) {
    throw createError({ statusCode: 400, message: 'Invalid return date format' })
  }
  const validCabins = ['economy', 'premium_economy', 'business', 'first']
  if (!validCabins.includes(cabinClass)) {
    throw createError({ statusCode: 400, message: 'Invalid cabin class' })
  }

  const today = new Date().toISOString().split('T')[0]
  if (String(departureDate) < today) {
    throw createError({ statusCode: 400, message: 'Departure date cannot be in the past' })
  }
  if (returnDate && String(returnDate) < String(departureDate)) {
    throw createError({ statusCode: 400, message: 'Return date cannot be before departure date' })
  }

  const adultsN = clampInt(body.adults, 1, 9, 1)
  const childrenN = clampInt(body.children, 0, 9, 0)
  const infantsN = clampInt(body.infants, 0, 4, 0)

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
      logger.error('No offer request ID returned from Duffel')
      throw createError({ statusCode: 500, message: 'No offer request ID returned from Duffel' })
    }

    // Map offers to simplified format
    const offers = rawOffers.map(mapOffer)

    // Fire-and-forget lead save
    const supabase = createServerSupabase()
    if (supabase) {
      supabase.from('flight_leads').insert({
        from_iata: origin,
        to_iata: destination,
        depart_date: departureDate,
        return_date: returnDate || null,
        adults: adultsN,
        children: childrenN,
        infants: infantsN,
        cabin_class: cabinClass,
      }).then(() => {}, (e: any) => logger.warn('Lead insert failed (non-fatal)', { error: e?.message }))
    }

    return { offerRequestId, offers }
  } catch (e: any) {
    if (e?.statusCode) throw e
    logger.error('Search failed', { errorMessage: e?.message })
    throw createError({ statusCode: 500, message: 'Search failed. Please try again.' })
  }
})
