export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
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
      title: 'YouFly — Book Flights Fast',
      meta: [
        { name: 'description', content: 'YouFly — Find and book cheap flights worldwide' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
})
