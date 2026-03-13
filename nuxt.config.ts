export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
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
    public: {
      siteUrl: '',
    },
  },
  app: {
    head: {
      title: 'YouFly — Rezervă zboruri rapid',
      meta: [
        { name: 'description', content: 'YouFly — Găsește și rezervă zboruri ieftine în toată lumea' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
})
