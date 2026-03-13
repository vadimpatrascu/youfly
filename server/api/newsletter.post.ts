import { createServerSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalid' })
  }

  // Store in Supabase (leads table with a special flag)
  const supabase = createServerSupabase()
  if (supabase) {
    await supabase.from('leads').insert({
      from_iata: 'NEWSLETTER',
      to_iata: email.substring(0, 50),
      depart_date: new Date().toISOString().split('T')[0],
      adults: 0,
    }).then(() => {}).catch(() => {})
  }

  return { success: true }
})
