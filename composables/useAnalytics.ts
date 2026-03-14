/**
 * Lightweight analytics wrapper.
 * Uses `window.gtag` if Google Analytics is loaded; otherwise logs in dev mode.
 */
export function useAnalytics() {
  const isDev = process.env.NODE_ENV === 'development'

  function track(event: string, params?: Record<string, string | number | boolean>) {
    if (typeof window === 'undefined') return
    if ((window as any).gtag) {
      (window as any).gtag('event', event, params)
    } else if (isDev) {
      console.debug(`[analytics] ${event}`, params)
    }
  }

  function trackSearch(origin: string, destination: string, date: string, passengers: number) {
    track('search', { origin, destination, date, passengers })
  }

  function trackSelectOffer(offerId: string, price: number, currency: string, airline: string) {
    track('select_offer', { offer_id: offerId, price, currency, airline })
  }

  function trackBookingStart(offerId: string) {
    track('begin_checkout', { offer_id: offerId })
  }

  function trackBookingComplete(orderId: string, price: number, currency: string) {
    track('purchase', { order_id: orderId, value: price, currency })
  }

  function trackPageView(path: string, title: string) {
    track('page_view', { page_path: path, page_title: title })
  }

  return { track, trackSearch, trackSelectOffer, trackBookingStart, trackBookingComplete, trackPageView }
}
