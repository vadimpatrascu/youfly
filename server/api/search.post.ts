import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { origin, destination, departureDate, returnDate, adults = 1, children = 0, infants = 0, cabinClass = 'economy' } = body

  if (!origin || !destination || !departureDate) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const slices: any[] = [
    { origin, destination, departure_date: departureDate }
  ]
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate })
  }

  const passengers: any[] = [
    ...Array(adults).fill({ type: 'adult' }),
    ...Array(children).fill({ type: 'child' }),
    ...Array(infants).fill({ type: 'infant_without_seat' }),
  ]

  try {
    const res = await duffelFetch<any>('/air/offer_requests', {
      method: 'POST',
      body: {
        data: {
          slices,
          passengers,
          cabin_class: cabinClass,
          return_offers: false,
        }
      }
    })

    const offerRequestId = res.data?.id
    if (!offerRequestId) throw createError({ statusCode: 500, message: 'No offer request ID returned' })

    // Fire-and-forget lead save
    const supabase = createServerSupabase()
    if (supabase) {
      supabase.from('leads').insert({
        from_iata: origin,
        to_iata: destination,
        depart_date: departureDate,
        return_date: returnDate || null,
        adults,
        children,
        infants,
        cabin_class: cabinClass,
      }).then(() => {}).catch(() => {})
    }

    return { offerRequestId }
  } catch (e: any) {
    console.error('Search error:', e?.message, e?.data)
    throw createError({ statusCode: 500, message: e?.message || 'Search failed' })
  }
})
