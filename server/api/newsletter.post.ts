import { createServerSupabase } from '../utils/supabase'
import { checkRateLimit } from '../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Rate limit: 3 newsletter signups per 5 minutes per IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = checkRateLimit(`newsletter:${ip}`, 3, 5 * 60_000)
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)))
    throw createError({ statusCode: 429, message: 'Too many requests. Please try again later.' })
  }

  const body = await readBody(event)
  const { email } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalid' })
  }

  // Store in dedicated newsletter_subscribers table (upsert to handle duplicates gracefully)
  const supabase = createServerSupabase()
  if (supabase) {
    try {
      await supabase.from('newsletter_subscribers').upsert(
        { email: email.substring(0, 255) },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    } catch {}
  }

  return { success: true }
})
