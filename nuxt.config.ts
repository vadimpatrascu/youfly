export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/main.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    locales: [
      { code: 'ro', name: 'Română', iso: 'ro-MD', file: 'ro.json' },
      { code: 'ru', name: 'Русский', iso: 'ru-RU', file: 'ru.json' },
      { code: 'en', name: 'English', iso: 'en-US', file: 'en.json' },
    ],
    defaultLocale: 'ro',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'youfly_locale',
      redirectOn: 'root',
      fallbackLocale: 'ro',
    },
  },

  runtimeConfig: {
    duffelApiToken: '',
    supabaseUrl: '',
    supabaseServiceRoleKey: '',
    resendApiKey: '',
    adminSecret: 'youfly-admin-2026',
    public: {
      siteUrl: 'https://youfly-xi.vercel.app',
      gaId: '', // Set NUXT_PUBLIC_GA_ID env var to enable Google Analytics
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'ro' },
      title: 'YouFly — Book flights fast',
      titleTemplate: '%s',
      meta: [
        { name: 'description', content: 'YouFly — Search and book cheap flights worldwide. Real-time prices, no hidden fees.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#030712' },
        // iOS PWA
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'YouFly' },
        // Android
        { name: 'mobile-web-app-capable', content: 'yes' },
        // OG
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'YouFly — Book flights fast' },
        { property: 'og:description', content: 'Search and book cheap flights worldwide.' },
        { property: 'og:url', content: 'https://youfly-xi.vercel.app' },
        { property: 'og:image', content: 'https://youfly-xi.vercel.app/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'YouFly — Book flights fast' },
        { name: 'twitter:description', content: 'Search and book cheap flights worldwide.' },
        { name: 'twitter:image', content: 'https://youfly-xi.vercel.app/og-image.png' },
        // Security
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
      noscript: [
        { innerHTML: 'YouFly requires JavaScript to search and book flights. Please enable JavaScript in your browser settings.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://assets.duffel.com' },
        { rel: 'preconnect', href: 'https://images.unsplash.com' },
        { rel: 'preload', as: 'image', href: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1400&q=80' },
        { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  nitro: {
    compressPublicAssets: true,
    future: { nativeSWR: true },
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Resource-Policy': 'same-origin',
          'X-DNS-Prefetch-Control': 'on',
          'X-Permitted-Cross-Domain-Policies': 'none',
          // CSP: allow Google Fonts, block all other external origins
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://assets.duffel.com https://images.unsplash.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "worker-src 'self'",
            "upgrade-insecure-requests",
          ].join('; '),
        },
      },
      '/api/airports': { cache: { maxAge: 3600 } },
      '/api/exchange-rate': { cache: { maxAge: 1800 } },
      '/api/prices': { cache: { maxAge: 900 } },
      '/blog/**': { cache: { maxAge: 3600, swr: true } },
      '/faq': { cache: { maxAge: 3600, swr: true } },
      '/about': { cache: { maxAge: 3600, swr: true } },
      '/visa': { cache: { maxAge: 3600, swr: true } },
      '/checkin': { cache: { maxAge: 3600, swr: true } },
      '/luggage': { cache: { maxAge: 3600, swr: true } },
      '/destinations': { cache: { maxAge: 3600, swr: true } },
      '/airports': { cache: { maxAge: 3600, swr: true } },
      '/deals': { cache: { maxAge: 1800, swr: true } },
      '/terms': { cache: { maxAge: 86400, swr: true } },
      '/privacy': { cache: { maxAge: 86400, swr: true } },
      '/contact': { cache: { maxAge: 3600, swr: true } },
    },
  },
})
