<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const articleData = [
  { slug: 'cum-sa-gasesti-bilete-ieftine', date: '2026-03-10', readTime: '5', category: 'tips', emoji: '💰', titleKey: 'blog.art1Title', excerptKey: 'blog.art1Excerpt', bodyKey: 'blog.art1Body' },
  { slug: 'top-destinatii-moldova', date: '2026-03-05', readTime: '7', category: 'destinations', emoji: '🌍', titleKey: 'blog.art2Title', excerptKey: 'blog.art2Excerpt', bodyKey: 'blog.art2Body' },
  { slug: 'bagaj-de-mana-ghid-complet', date: '2026-02-28', readTime: '8', category: 'preparation', emoji: '🎒', titleKey: 'blog.art3Title', excerptKey: 'blog.art3Excerpt', bodyKey: 'blog.art3Body' },
  { slug: 'rezervare-cu-escala-vs-direct', date: '2026-02-20', readTime: '6', category: 'tips', emoji: '✈️', titleKey: 'blog.art4Title', excerptKey: 'blog.art4Excerpt', bodyKey: 'blog.art4Body' },
  { slug: 'asigurare-calatorie-de-ce', date: '2026-02-15', readTime: '5', category: 'safety', emoji: '🛡️', titleKey: 'blog.art5Title', excerptKey: 'blog.art5Excerpt', bodyKey: 'blog.art5Body' },
  { slug: 'istanbul-ghid-3-zile', date: '2026-02-10', readTime: '10', category: 'guides', emoji: '🕌', titleKey: 'blog.art6Title', excerptKey: 'blog.art6Excerpt', bodyKey: 'blog.art6Body' },
]

const article = computed(() => {
  const raw = articleData.find(a => a.slug === route.params.slug)
  if (!raw) return null
  return {
    ...raw,
    title: t(raw.titleKey),
    excerpt: t(raw.excerptKey),
    body: t(raw.bodyKey),
  }
})

const categoryLabels: Record<string, string> = {
  tips: 'blog.tips', destinations: 'blog.destinationsTag',
  preparation: 'blog.preparation', safety: 'blog.safety', guides: 'blog.guides',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

const relatedArticles = computed(() => {
  if (!article.value) return []
  return articleData
    .filter(a => a.slug !== route.params.slug && a.category === article.value!.category)
    .slice(0, 2)
    .map(a => ({ ...a, title: t(a.titleKey) }))
})

// SEO
watchEffect(() => {
  if (article.value) {
    useSeo({
      title: article.value.title,
      description: article.value.excerpt,
      type: 'article',
    })
    useBlogPostStructuredData({
      title: article.value.title,
      excerpt: article.value.excerpt,
      date: article.value.date,
      slug: article.value.slug,
    })
    useBreadcrumbStructuredData([
      { name: 'YouFly', url: '/' },
      { name: t('nav.blog'), url: '/blog' },
      { name: article.value.title, url: `/blog/${article.value.slug}` },
    ])
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <!-- Back link -->
    <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline mb-8">
      <span aria-hidden="true">←</span> {{ t('blog.backToBlog') }}
    </NuxtLink>

    <!-- Not found -->
    <div v-if="!article" class="text-center py-16">
      <div aria-hidden="true" class="text-5xl mb-4">😕</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('blog.notFound') }}</h1>
      <p class="text-gray-500 mb-6">{{ t('blog.notFoundSub') }}</p>
      <NuxtLink to="/blog" class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">
        {{ t('blog.ctaMoreArticles') }}
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else>
      <!-- Header -->
      <header class="mb-8">
        <div aria-hidden="true" class="text-5xl mb-4 text-center">{{ article.emoji }}</div>
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <span class="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">
            {{ t(categoryLabels[article.category] || article.category) }}
          </span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">{{ article.title }}</h1>
        <p class="text-lg text-gray-500 leading-relaxed mb-4">{{ article.excerpt }}</p>
        <div class="flex items-center gap-3 text-sm text-gray-400 pb-6 border-b border-gray-200">
          <span aria-hidden="true">📅</span>
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
          <span aria-hidden="true">·</span>
          <span aria-hidden="true">⏱</span>
          <span>{{ article.readTime }} {{ t('blog.readTime') }}</span>
        </div>
      </header>

      <!-- Body -->
      <div class="space-y-4 text-gray-700 leading-relaxed text-base">
        <p v-for="(para, i) in article.body.split('\n\n').filter(Boolean)" :key="i">{{ para }}</p>
      </div>

      <!-- CTA -->
      <div class="mt-10 bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
        <div aria-hidden="true" class="text-3xl mb-3">✈️</div>
        <h3 class="font-bold text-gray-900 mb-2">{{ t('blog.ctaTitle') }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ t('blog.ctaSubtitle') }}</p>
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          {{ t('search.searchButton') }}
        </NuxtLink>
      </div>

      <!-- Related articles -->
      <section v-if="relatedArticles.length" class="mt-10" aria-labelledby="related-title">
        <h2 id="related-title" class="text-lg font-bold text-gray-900 mb-4">{{ t('blog.ctaMoreArticles') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NuxtLink v-for="rel in relatedArticles" :key="rel.slug"
            :to="`/blog/${rel.slug}`"
            class="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all flex items-center gap-3">
            <span aria-hidden="true" class="text-2xl shrink-0">{{ rel.emoji }}</span>
            <span class="text-sm font-medium text-gray-800 line-clamp-2">{{ rel.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </article>
  </div>
</template>
