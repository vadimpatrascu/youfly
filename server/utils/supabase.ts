import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Get or create a singleton Supabase client for server-side use.
 * Returns null if credentials are not configured.
 */
export function createServerSupabase(): SupabaseClient | null {
  if (_client) return _client

  const config = useRuntimeConfig()
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return null

  _client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10_000) }),
    },
  })

  return _client
}
