/**
 * Global error handler — captures Vue errors and unhandled rejections.
 * In production, this would send to Sentry/LogRocket.
 * For now, logs structured errors for Vercel's runtime logs.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Vue component errors — log and suppress crash propagation
  nuxtApp.vueApp.config.errorHandler = (error: any, _instance, info) => {
    console.error('[YouFly Error]', {
      message: error?.message || String(error),
      info,
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    })
    // Prevent error from crashing the entire app for non-fatal issues
    if (info && !info.includes('setup') && !info.includes('render')) {
      return // Suppress non-critical lifecycle errors
    }
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
