import { duffelFetch } from '../../utils/duffel'
import { enforceRateLimit } from '../../utils/rateLimit'
import { createPaymentIntent, grossChargeAmount } from '../../utils/payments'
import { sumSelectedServices } from '../../utils/seatMap'
import { isValidDuffelId } from '../../utils/validators'
import { logger } from '../../utils/logger'

/**
 * Creates a Duffel PaymentIntent for an offer.
 * The charged amount is the offer total grossed up by the card processing
 * fee, so the Balance top-up fully covers the order cost.
 */
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `payintent:${ip}`, 10, 60_000)

  const body = await readBody(event)
  const { offerId } = body || {}
  if (!isValidDuffelId(offerId)) {
    throw createError({ statusCode: 400, message: 'Valid offerId is required' })
  }
  // Selected seat service IDs (optional) — validated + priced server-side
  const serviceIds: string[] = Array.isArray(body?.serviceIds)
    ? body.serviceIds.filter((s: any) => isValidDuffelId(s)).slice(0, 18)
    : []

  try {
    // Re-fetch the offer server-side — never trust a client-supplied amount
    const offerRes = await duffelFetch<any>(`/air/offers/${offerId}`)
    const offer = offerRes.data
    if (!offer) throw createError({ statusCode: 404, message: 'Offer not found' })
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      throw createError({ statusCode: 422, message: 'offer_expired' })
    }

    // Add the real price of any chosen seats (re-fetched + validated, never trusted)
    let seatTotal = 0
    if (serviceIds.length) {
      const smRes = await duffelFetch<any>(`/air/seat_maps?offer_id=${offerId}`)
      seatTotal = sumSelectedServices(smRes.data || [], serviceIds).amount
    }

    const currency = offer.total_currency
    const netTotal = (parseFloat(offer.total_amount) + seatTotal).toFixed(2)
    const amount = grossChargeAmount(netTotal)
    if (amount === '0.00') {
      throw createError({ statusCode: 500, message: 'Could not price this offer' })
    }

    const pi = await createPaymentIntent(amount, currency)

    logger.info('PaymentIntent created', { paymentIntentId: pi.id, amount, currency, offerId, seats: serviceIds.length, seatTotal })

    return {
      paymentIntentId: pi.id,
      clientToken: pi.client_token,
      amount,
      currency,
      offerTotal: offer.total_amount,
      seatTotal: seatTotal.toFixed(2),
    }
  } catch (e: any) {
    if (e?.statusCode) throw e
    if (e?.code === 'unknown_service') {
      throw createError({ statusCode: 409, message: 'invalid_seat_selection' })
    }
    logger.error('PaymentIntent creation failed', { errorMessage: e?.message, offerId })
    throw createError({ statusCode: 503, message: 'payments_unavailable' })
  }
})
