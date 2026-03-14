import { createServerSupabase } from '../../utils/supabase'
import { checkRateLimit } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`admin:${ip}`, 10, 60_000)
  if (!rl.allowed) throw createError({ statusCode: 429, message: 'Too many requests' })

  // Read secret from Authorization header: "Bearer <secret>"
  const authHeader = getHeader(event, 'authorization') || ''
  const secret = useRuntimeConfig().adminSecret || 'youfly-admin-2026'
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (provided !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const [bookingsRes, leadsRes, subscribersRes] = await Promise.all([
    supabase.from('bookings').select('id, reference, status, total_amount, currency, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('leads').select('id, from_iata, to_iata, depart_date, adults, cabin_class, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
  ])

  const bookings = bookingsRes.data || []
  const leads = leadsRes.data || []
  const newsletterCount = subscribersRes.count || 0

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
  }
})
