import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { offerId, passengers, totalAmount, currency } = body

  if (!offerId || !passengers?.length) {
    throw createError({ statusCode: 400, message: 'offerId and passengers required' })
  }

  try {
    // Re-validate offer
    const offerRes = await duffelFetch<any>(`/air/offers/${offerId}`)
    const offer = offerRes.data
    if (!offer) throw createError({ statusCode: 404, message: 'Offer not found' })

    const expiresAt = new Date(offer.expires_at)
    if (expiresAt < new Date()) {
      throw createError({ statusCode: 422, message: 'offer_expired' })
    }

    // Map passengers to Duffel format
    const duffelPassengers = passengers.map((p: any) => ({
      id: p.duffelPassengerId,
      title: p.title || 'mr',
      gender: p.gender || 'm',
      given_name: p.given_name,
      family_name: p.family_name,
      born_on: p.born_on,
      email: p.email,
      phone_number: p.phone || '+37360000000',
      identity_documents: p.passport_number ? [{
        type: 'passport',
        unique_identifier: p.passport_number,
        issuing_country_code: p.passport_country || 'MD',
        expires_on: p.passport_expires || '2030-01-01',
      }] : undefined,
    }))

    // Create order
    const orderRes = await duffelFetch<any>('/air/orders', {
      method: 'POST',
      body: {
        data: {
          type: 'instant',
          selected_offers: [offerId],
          passengers: duffelPassengers,
          payments: [{
            type: 'balance',
            currency: offer.total_currency,
            amount: offer.total_amount,
          }],
        }
      }
    })

    const order = orderRes.data
    const reference = order.booking_reference || `YF-${Date.now()}`
    const duffelOrderId = order.id

    // Save to Supabase
    const supabase = createServerSupabase()
    let bookingId: string | null = null
    if (supabase) {
      const { data: booking } = await supabase.from('bookings').insert({
        duffel_order_id: duffelOrderId,
        reference,
        status: 'confirmed',
        total_amount: parseFloat(order.total_amount),
        currency: order.total_currency,
        raw_offer: offer,
        raw_order: order,
      }).select('id').single()
      bookingId = booking?.id

      if (bookingId) {
        await supabase.from('passengers').insert(
          passengers.map((p: any) => ({
            booking_id: bookingId,
            type: p.type || 'adult',
            first_name: p.given_name,
            last_name: p.family_name,
            email: p.email,
            phone: p.phone,
            dob: p.born_on,
            passport_no: p.passport_number,
          }))
        )
      }
    }

    return {
      reference,
      duffelOrderId,
      totalAmount: order.total_amount,
      currency: order.total_currency,
      slices: order.slices,
    }
  } catch (e: any) {
    if (e?.statusCode) throw e
    console.error('Book error:', e?.message, e?.data)
    throw createError({ statusCode: 500, message: e?.message || 'Booking failed' })
  }
})
