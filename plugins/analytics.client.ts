// Google Analytics 4 plugin — only loads when NUXT_PUBLIC_GA_ID is set
// and user has accepted cookie consent (GDPR compliance)
const CONSENT_KEY = 'youfly_cookie_consent'

function hasConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === 'accepted' } catch { return false }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const gaId = config.public.gaId as string

  if (!gaId || typeof window === 'undefined') return

  // Only load GA if user has accepted cookies
  if (!hasConsent()) return

  // Inject GA4 script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.appendChild(script)

  // Initialize gtag
  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) { (window as any).dataLayer.push(args) }
  ;(window as any).gtag = gtag
  gtag('js', new Date())
  gtag('config', gaId, {
    send_page_view: false, // We'll track page views manually
    anonymize_ip: true,
  })

  // Track route changes
  const router = useRouter()
  router.afterEach((to) => {
    gtag('event', 'page_view', {
      page_path: to.path,
      page_title: document.title,
    })
  })
})
