import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'
import { sendEmail, buildBookingConfirmationEmail } from '../utils/email'

/**
 * Send booking confirmation email.
 * Uses Resend API when RESEND_API_KEY is configured, otherwise logs to console.
 */
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `email:${ip}`, 3, 60_000)

  const body = await readBody(event)
  const { reference, email } = body

  if (!reference || typeof reference !== 'string' || !/^[A-Z0-9]{4,10}$/.test(reference)) {
    throw createError({ statusCode: 400, message: 'Invalid booking reference' })
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  // Look up booking from Supabase
  const supabase = createServerSupabase()
  if (!supabase) {
    throw createError({ statusCode: 503, message: 'Database not configured' })
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('reference, status, total_amount, currency, raw_offer, created_at')
    .eq('reference', reference)
    .maybeSingle()

  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  // Build flight details from offer
  const flights = (booking.raw_offer?.slices || []).map((s: any) => ({
    from: s.origin?.iata_code || '?',
    to: s.destination?.iata_code || '?',
    departure: s.departing_at || '',
  }))

  // Build and send HTML email
  const html = buildBookingConfirmationEmail({
    reference: booking.reference,
    amount: String(booking.total_amount),
    currency: booking.currency,
    flights,
  })

  const sent = await sendEmail({
    to: email,
    subject: `YouFly Booking Confirmation — ${booking.reference}`,
    html,
  })

  // Save email sent timestamp
  if (sent) {
    try {
      await supabase
        .from('bookings')
        .update({ confirmation_email_sent: new Date().toISOString() })
        .eq('reference', reference)
    } catch {
      // Non-fatal
    }
  }

  return { sent, to: email }
})
