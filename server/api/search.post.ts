import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'

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
    if (!offerRequestId) {
      console.error('No offer request ID in response:', JSON.stringify(res))
      throw createError({ statusCode: 500, message: 'No offer request ID returned from Duffel' })
    }

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

    return { offerRequestId }
  } catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Search error:', e?.message, JSON.stringify(e?.data || {}))
    const msg = e?.data?.errors?.[0]?.message || e?.message || 'Search failed'
    throw createError({ statusCode: 500, message: msg })
  }
})
