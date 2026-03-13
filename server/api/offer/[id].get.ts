import { duffelFetch } from '../../utils/duffel'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  try {
    const res = await duffelFetch<any>(`/air/offers/${id}`)
    return res.data
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 500, message: e?.message || 'Offer not found' })
  }
})
