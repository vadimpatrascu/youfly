/**
 * Startup validation: ensure critical environment variables are configured.
 * Logs warnings for missing optional vars, errors for critical ones.
 */
export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  const critical = [
    { key: 'duffelApiToken', label: 'NUXT_DUFFEL_API_TOKEN', val: config.duffelApiToken },
  ]

  const recommended = [
    { key: 'supabaseUrl', label: 'NUXT_SUPABASE_URL', val: config.supabaseUrl },
    { key: 'supabaseServiceRoleKey', label: 'NUXT_SUPABASE_SERVICE_ROLE_KEY', val: config.supabaseServiceRoleKey },
    { key: 'adminSecret', label: 'NUXT_ADMIN_SECRET', val: config.adminSecret },
  ]

  let hasError = false

  for (const { key, label, val } of critical) {
    if (!val) {
      console.error(`[ENV] CRITICAL: ${label} is not set. Flight search will not work.`)
      hasError = true
    }
  }

  for (const { key, label, val } of recommended) {
    if (!val) {
      console.warn(`[ENV] WARNING: ${label} is not set. Some features may be unavailable.`)
    }
  }

  if (!hasError) {
    console.log('[ENV] All critical environment variables validated.')
  }
})
