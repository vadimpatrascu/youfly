import { duffelFetch } from '../../utils/duffel'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 30 offer lookups per minute per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `offer:${ip}`, 30, 60_000)

  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw createError({ statusCode: 400, message: 'ID required' })

  try {
    const res = await duffelFetch<any>(`/air/offers/${id}`)
    return res.data
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 500, message: e?.message || 'Offer not found' })
  }
})
