import { createServerSupabase } from '../../utils/supabase'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 10 lookups per minute per IP to prevent reference enumeration
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `booking-lookup:${ip}`, 10, 60_000)

  const ref = getRouterParam(event, 'ref')
  if (!ref || !/^[A-Z0-9]{4,10}$/.test(ref.toUpperCase())) throw createError({ statusCode: 400, message: 'Reference required' })

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, reference, status, total_amount, currency, raw_offer, created_at, passengers(id, type, first_name, last_name, email, dob)')
    .eq('reference', ref.toUpperCase())
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!booking) throw createError({ statusCode: 404, message: 'Booking not found' })

  return booking
})
