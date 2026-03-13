interface SeoOptions {
  title: string
  description?: string
  image?: string
  type?: string
}

export function useSeo(options: SeoOptions) {
  const { locale } = useI18n()
  const route = useRoute()
  const siteUrl = 'https://youfly.vercel.app'

  const title = `${options.title} — YouFly`
  const description = options.description || 'Caută și rezervă zboruri la prețuri excelente. Comparăm sute de companii aeriene în timp real.'
  const image = options.image || `${siteUrl}/og-image.png`
  const url = `${siteUrl}${route.fullPath}`

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
