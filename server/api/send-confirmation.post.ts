import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'
import { sendEmail, buildBookingConfirmationEmail } from '../utils/email'
import { isValidBookingRef, isValidEmail } from '../utils/validators'

/**
 * Send booking confirmation email.
 * Uses Resend API when RESEND_API_KEY is configured, otherwise logs to console.
 */
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `email:${ip}`, 3, 60_000)

  const body = await readBody(event)
  const { reference, email } = body

  if (!isValidBookingRef(reference)) {
    throw createError({ statusCode: 400, message: 'Invalid booking reference' })
  }
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  // Per-reference limit: max 3 confirmation emails per booking per hour,
  // regardless of requester IP — prevents using this endpoint to spam
  // arbitrary addresses with someone's booking details.
  enforceRateLimit(event, `email-ref:${String(reference).toUpperCase()}`, 3, 60 * 60_000)

  // Look up booking from Supabase
  const supabase = createServerSupabase()
  if (!supabase) {
    throw createError({ statusCode: 503, message: 'Database not configured' })
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('reference, status, total_amount, currency, raw_offer, created_at, passengers(email)')
    .eq('reference', reference)
    .maybeSingle()

  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  // Only allow sending to an email that belongs to the booking.
  // (Bookings always store the lead passenger's email.)
  const bookingEmails = ((booking as any).passengers || [])
    .map((p: any) => (p?.email || '').trim().toLowerCase())
    .filter(Boolean)
  if (bookingEmails.length && !bookingEmails.includes(email.trim().toLowerCase())) {
    throw createError({ statusCode: 403, message: 'Email does not match this booking' })
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
