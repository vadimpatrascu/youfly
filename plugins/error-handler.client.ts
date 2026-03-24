/**
 * Global error handler — captures Vue errors and unhandled rejections.
 * In production, this would send to Sentry/LogRocket.
 * For now, logs structured errors for Vercel's runtime logs.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Vue component errors
  nuxtApp.vueApp.config.errorHandler = (error: any, _instance, info) => {
    console.error('[YouFly Error]', {
      message: error?.message || String(error),
      info,
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    })
  }

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[YouFly Unhandled]', {
      message: event.reason?.message || String(event.reason),
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    })
  })
})
