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
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'YouFly',
    url: 'https://youfly.vercel.app',
    description: 'Caută și rezervă zboruri ieftine din Moldova. Prețuri în timp real, fără taxe ascunse.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://youfly.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  })
}

export function useOrganizationStructuredData() {
  useStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'YouFly',
    url: 'https://youfly.vercel.app',
    logo: 'https://youfly.vercel.app/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Romanian', 'Russian', 'English'],
    },
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
