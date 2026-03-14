export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/main.css'],

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
    adminSecret: 'youfly-admin-2026',
    public: {
      siteUrl: 'https://youfly-xi.vercel.app',
      gaId: '', // Set NUXT_PUBLIC_GA_ID env var to enable Google Analytics
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ro' },
      title: 'YouFly — Book flights fast',
      titleTemplate: '%s',
      meta: [
        { name: 'description', content: 'YouFly — Search and book cheap flights worldwide. Real-time prices, no hidden fees.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0284c7' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'YouFly — Book flights fast' },
        { property: 'og:description', content: 'Search and book cheap flights worldwide.' },
        { property: 'og:url', content: 'https://youfly-xi.vercel.app' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'YouFly — Book flights fast' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/logo.svg' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    },
  },

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          // CSP: allow Google Fonts, block all other external origins
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://assets.duffel.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
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
    },
  },
})
