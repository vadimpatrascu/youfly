import { createServerSupabase } from '../utils/supabase'
import { enforceRateLimit } from '../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 3 messages per 10 minutes per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `contact:${ip}`, 3, 10 * 60_000)

  const body = await readBody(event)
  const { name, email, subject, message } = body

  // Validate required fields
  const nameStr = (name || '').trim().substring(0, 200)
  const emailStr = (email || '').trim().substring(0, 255)
  const subjectStr = (subject || '').trim().substring(0, 200)
  const messageStr = (message || '').trim().substring(0, 5000)

  if (!nameStr || nameStr.length < 2) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }
  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    throw createError({ statusCode: 400, message: 'Valid email is required' })
  }
  if (!messageStr || messageStr.length < 10) {
    throw createError({ statusCode: 400, message: 'Message must be at least 10 characters' })
  }

  // Store in Supabase (best-effort)
  const supabase = createServerSupabase()
  if (supabase) {
    try {
      await supabase.from('contact_messages').insert({
        name: nameStr,
        email: emailStr,
        subject: subjectStr || 'other',
        message: messageStr,
      })
    } catch {}
  }

  return { success: true }
})
