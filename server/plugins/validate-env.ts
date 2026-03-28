/**
 * Startup validation: ensure critical environment variables are configured.
 * Logs warnings for missing optional vars, errors for critical ones.
 */
import { logger } from '../utils/logger'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()

  const critical = [
    { label: 'NUXT_DUFFEL_API_TOKEN', val: config.duffelApiToken },
  ]

  const recommended = [
    { label: 'NUXT_SUPABASE_URL', val: config.supabaseUrl },
    { label: 'NUXT_SUPABASE_SERVICE_ROLE_KEY', val: config.supabaseServiceRoleKey },
    { label: 'NUXT_ADMIN_SECRET', val: config.adminSecret },
  ]

  let hasError = false

  for (const { label, val } of critical) {
    if (!val) {
      logger.error('Missing critical env var', { envVar: label, impact: 'Flight search will not work' })
      hasError = true
    }
  }

  for (const { label, val } of recommended) {
    if (!val) {
      logger.warn('Missing recommended env var', { envVar: label })
    }
  }

  if (!hasError) {
    logger.info('Environment validation passed', { critical: critical.length, recommended: recommended.length })
  }
})
