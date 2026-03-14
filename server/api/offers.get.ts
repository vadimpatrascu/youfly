import { duffelFetch } from '../utils/duffel'
import { checkRateLimit } from '../utils/rateLimit'
import { mapOffer } from '../utils/mapOffer'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`offers:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)))
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }

  const query = getQuery(event)
  const offerRequestId = query.offer_request_id as string
  if (!offerRequestId || !/^[a-zA-Z0-9_-]{1,100}$/.test(offerRequestId)) throw createError({ statusCode: 400, message: 'offer_request_id required' })

  try {
    let allOffers: any[] = []
    let after: string | null = null
    let pages = 0
    const maxPages = 3

    // Paginate through results
    do {
      const url = `/air/offer_requests/${offerRequestId}/offers?sort=total_amount&limit=50${after ? `&after=${after}` : ''}`
      const res = await duffelFetch<any>(url)
      const offers = res.data || []
      allOffers = allOffers.concat(offers)
      after = res.meta?.after || null
      pages++
    } while (after && pages < maxPages)

    return allOffers.map(mapOffer)
  } catch (e: any) {
    if (e?.statusCode) throw e
    throw createError({ statusCode: 500, message: e?.message || 'Failed to fetch offers' })
  }
})
