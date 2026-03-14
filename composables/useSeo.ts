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
  const image = options.image || `${siteUrl}/og-image.png`
  const url = `${siteUrl}${route.path}`

  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:locale', content: locale.value === 'ro' ? 'ro_RO' : locale.value === 'ru' ? 'ru_RU' : 'en_US' },
      { property: 'og:locale:alternate', content: locale.value === 'ro' ? 'ru_RU' : 'ro_RO' },
      { property: 'og:locale:alternate', content: 'en_US' },
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
