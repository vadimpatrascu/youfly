import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  const config = useRuntimeConfig()
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
}
