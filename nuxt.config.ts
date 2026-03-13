export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxtjs/i18n'],

  i18n: {
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
      siteUrl: 'https://youfly.vercel.app',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ro' },
      title: 'YouFly — Rezervă zboruri rapid',
      titleTemplate: '%s',
      meta: [
        { name: 'description', content: 'YouFly — Caută și rezervă zboruri ieftine în toată lumea. Prețuri în timp real, fără taxe ascunse.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0284c7' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'YouFly — Rezervă zboruri rapid' },
        { property: 'og:description', content: 'Caută și rezervă zboruri ieftine în toată lumea.' },
        { property: 'og:url', content: 'https://youfly.vercel.app' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'YouFly — Rezervă zboruri rapid' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#9992;</text></svg>' },
      ],
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
})
