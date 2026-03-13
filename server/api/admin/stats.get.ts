import { createServerSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  // Simple secret check via query param (not production-grade, just for demo)
  const query = getQuery(event)
  const secret = useRuntimeConfig().adminSecret || 'youfly-admin-2026'
  if (query.secret !== secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase = createServerSupabase()
  if (!supabase) throw createError({ statusCode: 503, message: 'Database not configured' })

  const [bookingsRes, leadsRes] = await Promise.all([
    supabase.from('bookings').select('id, reference, status, total_amount, currency, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('leads').select('id, from_iata, to_iata, depart_date, adults, cabin_class, created_at').order('created_at', { ascending: false }).limit(50),
  ])

  const bookings = bookingsRes.data || []
  const leads = leadsRes.data || []

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
    },
    topDestinations,
    recentBookings: bookings.slice(0, 5),
    recentLeads: leads.slice(0, 10),
  }
})
