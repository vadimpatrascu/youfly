import { createServerSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
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
