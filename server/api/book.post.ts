import { duffelFetch } from '../utils/duffel'
import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'
import { getPaymentIntent, confirmPaymentIntent, tryRefundPaymentIntent, grossChargeAmount } from '../utils/payments'
import { isValidDuffelId, isValidDate, isValidEmail, isValidPhone, safeString } from '../utils/validators'
import { logger } from '../utils/logger'

// Per-instance guard against double-spending a PaymentIntent
// (authoritative check is the unique index on payments.payment_intent_id)
const usedPaymentIntents = new Set<string>()

function normalizePhone(phone: string): string {
  if (!phone || !phone.trim()) {
    throw createError({ statusCode: 400, message: 'Phone number is required for the lead passenger' })
  }
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) {
    throw createError({ statusCode: 400, message: 'Invalid phone number' })
  }
  if (phone.startsWith('+')) return phone.trim()
  if (digits.startsWith('373')) return `+${digits}`
  if (digits.startsWith('0')) return `+373${digits.substring(1)}`
  return `+373${digits}`
}

export default defineEventHandler(async (event) => {
  // Rate limit: 5 bookings per minute per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `book:${ip}`, 5, 60_000)

  const body = await readBody(event)
  const { offerId, passengers, paymentIntentId } = body

  if (!isValidDuffelId(offerId)) {
    throw createError({ statusCode: 400, message: 'Valid offerId is required' })
  }
  if (!isValidDuffelId(paymentIntentId)) {
    throw createError({ statusCode: 402, message: 'payment_required' })
  }
  if (!passengers?.length || !Array.isArray(passengers) || passengers.length > 9) {
    throw createError({ statusCode: 400, message: 'Passengers array is required (max 9)' })
  }

  for (const p of passengers) {
    const name = safeString(p.given_name, 100)
    const surname = safeString(p.family_name, 100)
    if (!name || !surname) {
      throw createError({ statusCode: 400, message: 'Invalid passenger name' })
    }
    if (!isValidDate(p.born_on)) {
      throw createError({ statusCode: 400, message: 'Invalid passenger date of birth' })
    }
    if (p.email && !isValidEmail(p.email)) {
      throw createError({ statusCode: 400, message: 'Invalid passenger email' })
    }
    if (p.passport_expires && !isValidDate(p.passport_expires)) {
      throw createError({ statusCode: 400, message: 'Invalid passport expiry date' })
    }
    if (p.passport_number && typeof p.passport_number === 'string' && p.passport_number.length > 20) {
      throw createError({ statusCode: 400, message: 'Invalid passport number' })
    }
    if (p.passport_country && typeof p.passport_country === 'string' && !/^[A-Z]{2}$/.test(p.passport_country.toUpperCase())) {
      throw createError({ statusCode: 400, message: 'Invalid passport country code' })
    }
    if (!isValidDuffelId(p.duffelPassengerId)) {
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

    // ── Verify the customer's payment before touching Duffel orders ──
    const supabase = createServerSupabase()

    // Idempotency: a PaymentIntent can pay for exactly one order
    if (usedPaymentIntents.has(paymentIntentId)) {
      throw createError({ statusCode: 409, message: 'payment_already_used' })
    }
    if (supabase) {
      const { data: existing } = await supabase
        .from('payments').select('id, status').eq('payment_intent_id', paymentIntentId).maybeSingle()
      if (existing && existing.status === 'order_created') {
        throw createError({ statusCode: 409, message: 'payment_already_used' })
      }
    }

    const pi = await getPaymentIntent(paymentIntentId)
    if (!pi) throw createError({ statusCode: 402, message: 'payment_required' })

    // Amount must match the current gross price for this exact offer
    const expectedAmount = grossChargeAmount(offer.total_amount)
    if (pi.currency !== offer.total_currency || parseFloat(pi.amount) + 0.005 < parseFloat(expectedAmount)) {
      logger.error('Payment amount mismatch', { paymentIntentId, piAmount: pi.amount, expectedAmount, piCurrency: pi.currency, offerCurrency: offer.total_currency })
      throw createError({ statusCode: 409, message: 'payment_mismatch' })
    }

    if (pi.status === 'requires_payment_method') {
      throw createError({ statusCode: 402, message: 'payment_required' })
    }

    // Confirm collects the funds into our Duffel Balance.
    // 'succeeded' means it was already confirmed (e.g. retry after a failed order).
    if (pi.status !== 'succeeded') {
      try {
        await confirmPaymentIntent(paymentIntentId)
      } catch (confirmErr: any) {
        logger.error('PaymentIntent confirm failed', { paymentIntentId, errorMessage: confirmErr?.message })
        throw createError({ statusCode: 402, message: 'payment_failed' })
      }
    }
    usedPaymentIntents.add(paymentIntentId)

    // Record the confirmed payment (best-effort audit trail)
    if (supabase) {
      try {
        await supabase.from('payments').upsert({
          payment_intent_id: paymentIntentId,
          offer_id: offerId,
          amount: parseFloat(pi.amount),
          currency: pi.currency,
          status: 'confirmed',
        }, { onConflict: 'payment_intent_id' })
      } catch (e: any) {
        logger.warn('Payment record save failed (non-fatal)', { error: e?.message })
      }
    }

    // Lead passenger's contact details are used as fallback for the rest —
    // only the lead is asked for email/phone in the booking form.
    const leadEmail = passengers[0]?.email?.trim() || ''
    const leadPhone = passengers[0]?.phone || ''
    if (!leadPhone.trim()) {
      throw createError({ statusCode: 400, message: 'Phone number is required for the lead passenger' })
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
        email: p.email?.trim() || leadEmail || 'booking@youfly.md',
        phone_number: normalizePhone(p.phone?.trim() ? p.phone : leadPhone),
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

    // Create order — paid from the Balance we just topped up.
    // If this fails after the customer was charged, refund automatically.
    let orderRes: any
    try {
      // retries=0: order creation is NOT idempotent — retrying an ambiguous
      // failure could issue duplicate tickets. Fail fast and refund instead.
      orderRes = await duffelFetch<any>('/air/orders', {
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
            metadata: { payment_intent_id: paymentIntentId },
          }
        }
      }, 0)
    } catch (orderErr: any) {
      usedPaymentIntents.delete(paymentIntentId)
      const refunded = await tryRefundPaymentIntent(paymentIntentId)
      if (!refunded) {
        // Manual action needed — make this impossible to miss in logs
        logger.error('REFUND REQUIRED: order failed after payment was confirmed', {
          paymentIntentId, offerId, amount: pi.amount, currency: pi.currency,
          action: 'Refund this payment manually in the Duffel dashboard (Balance page)',
        })
      }
      if (supabase) {
        try {
          await supabase.from('payments')
            .update({ status: refunded ? 'refunded' : 'refund_required' })
            .eq('payment_intent_id', paymentIntentId)
        } catch {}
      }
      logger.error('Order creation failed after payment', {
        paymentIntentId, refunded, errorMessage: orderErr?.data?.errors?.[0]?.message || orderErr?.message,
      })
      throw createError({ statusCode: 502, message: 'booking_failed_refund' })
    }

    const order = orderRes.data
    if (!order) throw createError({ statusCode: 500, message: 'No order returned from Duffel' })

    const reference = order.booking_reference || `YF${Date.now()}`
    const duffelOrderId = order.id

    // Save to Supabase (best-effort)
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
        logger.warn('Supabase booking save failed (non-fatal)', { error: dbErr.message })
      }
      // Mark the payment as spent on this order (idempotency source of truth)
      try {
        await supabase.from('payments')
          .update({ status: 'order_created', booking_id: bookingId, duffel_order_id: duffelOrderId })
          .eq('payment_intent_id', paymentIntentId)
      } catch {}
    }

    logger.info('Order created', { reference, duffelOrderId, paymentIntentId })

    return {
      reference,
      duffelOrderId,
      totalAmount: order.total_amount,
      currency: order.total_currency,
    }
  } catch (e: any) {
    if (e?.statusCode) throw e
    // Log full error for debugging but return safe message to client
    const internalMsg = e?.data?.errors?.[0]?.message || e?.message || 'unknown'
    logger.error('Booking failed', { errorMessage: internalMsg })
    throw createError({ statusCode: 500, message: 'Booking failed. Please try again or contact support.' })
  }
})
