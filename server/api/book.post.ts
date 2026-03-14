import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'

function normalizePhone(phone: string): string {
  if (!phone) return '+37360000000'
  const digits = phone.replace(/\D/g, '')
  if (phone.startsWith('+')) return phone.trim()
  if (digits.startsWith('373')) return `+${digits}`
  if (digits.startsWith('0')) return `+373${digits.substring(1)}`
  return `+${digits}`
}

export default defineEventHandler(async (event) => {
  // Rate limit: 5 bookings per minute per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `book:${ip}`, 5, 60_000)

  const body = await readBody(event)
  const { offerId, passengers } = body

  if (!offerId || typeof offerId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(offerId)) {
    throw createError({ statusCode: 400, message: 'offerId and passengers are required' })
  }
  if (!passengers?.length || !Array.isArray(passengers) || passengers.length > 9) {
    throw createError({ statusCode: 400, message: 'offerId and passengers are required' })
  }

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  for (const p of passengers) {
    const name = (p.given_name || '').trim()
    const surname = (p.family_name || '').trim()
    if (!name || name.length > 100 || !surname || surname.length > 100) {
      throw createError({ statusCode: 400, message: 'Invalid passenger name' })
    }
    if (!p.born_on || !dateRe.test(p.born_on)) {
      throw createError({ statusCode: 400, message: 'Invalid passenger date of birth' })
    }
    if (p.email && !emailRe.test(p.email)) {
      throw createError({ statusCode: 400, message: 'Invalid passenger email' })
    }
    if (p.passport_expires && !dateRe.test(p.passport_expires)) {
      throw createError({ statusCode: 400, message: 'Invalid passport expiry date' })
    }
    if (!p.duffelPassengerId || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.duffelPassengerId)) {
      throw createError({ statusCode: 400, message: 'Invalid passenger ID' })
    }
  }

  try {
    // Re-fetch offer to get current price and validate expiry
    const offerRes = await duffelFetch<any>(`/air/offers/${offerId}`)
    const offer = offerRes.data
    if (!offer) throw createError({ statusCode: 404, message: 'Offer not found' })

    if (new Date(offer.expires_at) < new Date()) {
      throw createError({ statusCode: 422, message: 'offer_expired' })
    }

    // Build Duffel passengers array - IDs must match the offer's passenger IDs
    const duffelPassengers = passengers.map((p: any) => {
      const pass: any = {
        id: p.duffelPassengerId,
        title: p.title || 'mr',
        gender: p.gender || 'm',
        given_name: p.given_name?.trim(),
        family_name: p.family_name?.trim(),
        born_on: p.born_on,
        email: p.email?.trim() || 'booking@youfly.md',
        phone_number: normalizePhone(p.phone || ''),
      }
      // Add passport if provided
      if (p.passport_number?.trim()) {
        pass.identity_documents = [{
          type: 'passport',
          unique_identifier: p.passport_number.trim(),
          issuing_country_code: p.passport_country || 'MD',
          expires_on: p.passport_expires || '2030-12-31',
        }]
      }
      return pass
    })

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
            amount: offer.total_amount, // Must be exact string from offer
          }],
        }
      }
    })

    const order = orderRes.data
    if (!order) throw createError({ statusCode: 500, message: 'No order returned from Duffel' })

    const reference = order.booking_reference || `YF${Date.now()}`
    const duffelOrderId = order.id

    // Save to Supabase (best-effort)
    const supabase = createServerSupabase()
    let bookingId: string | null = null
    if (supabase) {
      try {
        const { data: bk } = await supabase.from('bookings').insert({
          duffel_order_id: duffelOrderId,
          reference,
          status: 'confirmed',
          total_amount: parseFloat(order.total_amount),
          currency: order.total_currency,
          raw_offer: offer,
          raw_order: order,
        }).select('id').single()
        bookingId = bk?.id

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
              passport_no: p.passport_number || null,
            }))
          )
        }
      } catch (dbErr: any) {
        console.error('Supabase save error (non-fatal):', dbErr.message)
      }
    }

    return {
      reference,
      duffelOrderId,
      totalAmount: order.total_amount,
      currency: order.total_currency,
    }
  } catch (e: any) {
    if (e?.statusCode) throw e
    const msg = e?.data?.errors?.[0]?.message || e?.message || 'Booking failed'
    console.error('Book error:', msg, JSON.stringify(e?.data || {}))
    throw createError({ statusCode: 500, message: msg })
  }
})
