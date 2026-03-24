/**
 * Core Web Vitals tracking — reports LCP, FID, CLS to console.
 * Visible in Vercel runtime logs for performance monitoring.
 * Uses the native PerformanceObserver API (no dependencies).
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return

  // Largest Contentful Paint
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1] as any
      if (lcp) {
        console.log('[WebVitals] LCP:', Math.round(lcp.startTime), 'ms', lcp.element?.tagName || '')
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}

  // Cumulative Layout Shift
  try {
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })

    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('[WebVitals] CLS:', clsValue.toFixed(4))
      }
    }, { once: true })
  } catch {}

  // First Input Delay
  try {
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as any
      if (entry) {
        console.log('[WebVitals] FID:', Math.round(entry.processingStart - entry.startTime), 'ms')
      }
    }).observe({ type: 'first-input', buffered: true })
  } catch {}
})
