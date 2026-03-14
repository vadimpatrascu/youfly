// Composable for injecting JSON-LD structured data for SEO

export function useStructuredData(data: Record<string, any>) {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(data),
    }]
  })
}

export function useWebsiteStructuredData() {
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string || 'https://youfly-xi.vercel.app'
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'YouFly',
    url: siteUrl,
    description: t('hero.subtitle'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  })
}

export function useOrganizationStructuredData() {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string || 'https://youfly-xi.vercel.app'
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YouFly',
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    email: 'support@youfly.md',
    telephone: '+37322000000',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MD',
      addressLocality: 'Chișinău',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+37322000000',
      contactType: 'customer service',
      availableLanguage: ['Romanian', 'Russian', 'English'],
    },
  })
}

export function useBlogPostStructuredData(article: { title: string; excerpt: string; date: string; slug: string }) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string || 'https://youfly-xi.vercel.app'
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    url: `${siteUrl}/blog/${article.slug}`,
    image: `${siteUrl}/og-image.svg`,
    author: {
      '@type': 'Organization',
      name: 'YouFly',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'YouFly',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${article.slug}`,
    },
  })
}

export function useBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl as string || 'https://youfly-xi.vercel.app'
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  })
}

export function useFAQStructuredData(items: { question: string; answer: string }[]) {
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
}
