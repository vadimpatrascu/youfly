import { enforceRateLimit } from '../utils/rateLimit'
import { createServerSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  enforceRateLimit(event, `health:${ip}`, 30, 60_000)

  const config = useRuntimeConfig()
  const checks: Record<string, 'ok' | 'missing' | 'error'> = {
    duffel: config.duffelApiToken ? 'ok' : 'missing',
    supabase: 'missing',
  }

  const supabase = createServerSupabase()
  if (supabase) {
    try {
      const { error } = await supabase.from('bookings').select('id', { count: 'exact', head: true })
      checks.supabase = error ? 'error' : 'ok'
    } catch {
      checks.supabase = 'error'
    }
  }

  const allOk = Object.values(checks).every(v => v === 'ok')

  return {
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: checks,
  }
})
