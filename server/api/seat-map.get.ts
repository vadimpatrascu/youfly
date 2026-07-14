import { duffelFetch } from '../utils/duffel'
import { enforceRateLimit } from '../utils/rateLimit'
import { mapSeatMaps } from '../utils/seatMap'
import { isValidDuffelId } from '../utils/validators'
import { logger } from '../utils/logger'

/**
 * Returns the real Duffel seat map for an offer, simplified for rendering.
 * Seat maps are frequently unavailable (many airlines/offers have none) — in
 * that case we return an empty, non-error result so the UI can offer to skip.
 */
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `seatmap:${ip}`, 20, 60_000)

  const offerId = String(getQuery(event).offer_id || '')
  if (!isValidDuffelId(offerId)) {
    throw createError({ statusCode: 400, message: 'offer_id required' })
  }

  try {
    const [offerRes, smRes] = await Promise.all([
      duffelFetch<any>(`/air/offers/${offerId}`),
      duffelFetch<any>(`/air/seat_maps?offer_id=${offerId}`),
    ])
    const segments = mapSeatMaps(smRes.data || [], offerRes.data)
    const available = segments.some((s) =>
      s.rows.some((r) => r.sections.some((sec) => sec.some((e) => e.services && Object.keys(e.services).length)))
    )
    return { segments, available }
  } catch (e: any) {
    logger.warn('Seat map unavailable', { error: e?.message, offerId })
    return { segments: [], available: false }
  }
})
