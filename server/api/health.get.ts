export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      duffel: config.duffelApiToken ? 'configured' : 'missing',
      supabase: config.supabaseUrl ? 'configured' : 'missing',
    }
  }
})
