import { createServerSupabase } from '../../utils/supabase'
import { checkRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 10 lookups per minute per IP to prevent reference enumeration
  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0] || getHeader(event, 'x-real-ip') || 'unknown'
  const rl = checkRateLimit(`booking-lookup:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    throw createError({ statusCode: 429, message: 'Too many requests. Please wait.' })
  }

  const ref = getRouterParam(event, 'ref')
  if (!ref) throw createError({ statusCode: 400, message: 'Reference required' })

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, passengers(*)')
    .eq('reference', ref.toUpperCase())
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!booking) throw createError({ statusCode: 404, message: 'Booking not found' })

  return booking
})
