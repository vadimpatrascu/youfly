import { createServerSupabase } from '../../utils/supabase'
import { enforceRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `admin:${ip}`, 10, 60_000)

  // Read secret from Authorization header: "Bearer <secret>"
  const authHeader = getHeader(event, 'authorization') || ''
  const secret = useRuntimeConfig().adminSecret || 'youfly-admin-2026'
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (provided !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const [bookingsRes, leadsRes, subscribersRes, contactRes] = await Promise.all([
    supabase.from('bookings').select('id, reference, status, total_amount, currency, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('leads').select('id, from_iata, to_iata, depart_date, adults, cabin_class, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('id, name, email, subject, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const bookings = bookingsRes.data || []
  const leads = leadsRes.data || []
  const newsletterCount = subscribersRes.count || 0
  const contactMessages = contactRes.data || []

  // Aggregate stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0)
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

  // Top destinations from leads
  const destCounts: Record<string, number> = {}
  leads.forEach(l => { destCounts[l.to_iata] = (destCounts[l.to_iata] || 0) + 1 })
  const topDestinations = Object.entries(destCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([iata, count]) => ({ iata, count }))

  return {
    summary: {
      totalBookings: bookings.length,
      confirmedBookings: confirmedCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalLeads: leads.length,
      newsletterSubscribers: newsletterCount,
    },
    topDestinations,
    recentBookings: bookings.slice(0, 5),
    recentLeads: leads.slice(0, 10),
    recentContactMessages: contactMessages,
  }
})
