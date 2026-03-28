import { createServerSupabase } from '../../utils/supabase'
import { enforceRateLimit } from '../../utils/rateLimit'
import { isValidBookingRef } from '../../utils/validators'

export default defineEventHandler(async (event) => {
  // Rate limit: 10 lookups per minute per IP to prevent reference enumeration
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `booking-lookup:${ip}`, 10, 60_000)

  const ref = getRouterParam(event, 'ref')
  if (!isValidBookingRef(ref)) throw createError({ statusCode: 400, message: 'Reference required' })

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, reference, status, total_amount, currency, raw_offer, created_at, passengers(id, type, first_name, last_name, email, dob)')
    .eq('reference', ref.toUpperCase())
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: 'Lookup failed' })
  if (!booking) throw createError({ statusCode: 404, message: 'Booking not found' })

  // Mask sensitive data before returning
  if (booking.passengers) {
    booking.passengers = booking.passengers.map((p: any) => ({
      ...p,
      email: p.email ? p.email[0] + '***@' + p.email.split('@')[1] : null,
    }))
  }
  // Strip raw Duffel response to avoid leaking API internals
  if (booking.raw_offer) {
    booking.raw_offer = {
      slices: (booking.raw_offer.slices || []).map((s: any) => ({
        origin: s.origin ? { iata_code: s.origin.iata_code, city_name: s.origin.city_name || s.origin.city?.name } : null,
        destination: s.destination ? { iata_code: s.destination.iata_code, city_name: s.destination.city_name || s.destination.city?.name } : null,
        departing_at: s.departing_at,
        arriving_at: s.arriving_at,
      })),
    }
  }

  return booking
})
