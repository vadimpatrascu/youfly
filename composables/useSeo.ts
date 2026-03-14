interface SeoOptions {
  title: string
  description?: string
  image?: string
  type?: string
}

export function useSeo(options: SeoOptions) {
  const { locale, t } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string || 'https://youfly-xi.vercel.app'

  const title = `${options.title} — YouFly`
  const description = options.description || t('hero.subtitle')
  const image = options.image || `${siteUrl}/og-image.svg`
  const url = `${siteUrl}${route.path}`

  const ogLocale = locale.value === 'ro' ? 'ro_RO' : locale.value === 'ru' ? 'ru_RU' : 'en_US'
  // All alternate locales excluding the current one
  const allLocales = ['ro_RO', 'ru_RU', 'en_US'].filter(l => l !== ogLocale)

  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:site_name', content: 'YouFly' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: title },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:url', content: url },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:locale', content: ogLocale },
      ...allLocales.map((l, i) => ({ key: `og:locale:alternate:${i}`, property: 'og:locale:alternate', content: l })),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    link: [
      { rel: 'canonical', href: url },
    ],
  })
}
