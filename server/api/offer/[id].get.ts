import { duffelFetch } from '../../utils/duffel'
import { checkRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 30 offer lookups per minute per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`offer:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    throw createError({ statusCode: 429, message: 'Too many requests. Please wait.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  try {
    const res = await duffelFetch<any>(`/air/offers/${id}`)
    return res.data
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 500, message: e?.message || 'Offer not found' })
  }
})
