<script setup lang="ts">
const { t, locale } = useI18n()
useSeo({ title: t('blog.title'), description: t('blog.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('nav.blog'), url: '/blog' },
])

// Blog listing structured data
useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: t('blog.title'),
  description: t('blog.seoDesc'),
  url: 'https://youfly-xi.vercel.app/blog',
  publisher: { '@type': 'Organization', name: 'YouFly', url: 'https://youfly-xi.vercel.app' },
})

const articleData = [
  { slug: 'cum-sa-gasesti-bilete-ieftine', date: '2026-03-10', readTime: '5', category: 'tips', emoji: '💰', titleKey: 'blog.art1Title', excerptKey: 'blog.art1Excerpt' },
  { slug: 'top-destinatii-moldova', date: '2026-03-05', readTime: '7', category: 'destinations', emoji: '🌍', titleKey: 'blog.art2Title', excerptKey: 'blog.art2Excerpt' },
  { slug: 'bagaj-de-mana-ghid-complet', date: '2026-02-28', readTime: '8', category: 'preparation', emoji: '🎒', titleKey: 'blog.art3Title', excerptKey: 'blog.art3Excerpt' },
  { slug: 'rezervare-cu-escala-vs-direct', date: '2026-02-20', readTime: '6', category: 'tips', emoji: '✈️', titleKey: 'blog.art4Title', excerptKey: 'blog.art4Excerpt' },
  { slug: 'asigurare-calatorie-de-ce', date: '2026-02-15', readTime: '5', category: 'safety', emoji: '🛡️', titleKey: 'blog.art5Title', excerptKey: 'blog.art5Excerpt' },
  { slug: 'istanbul-ghid-3-zile', date: '2026-02-10', readTime: '10', category: 'guides', emoji: '🕌', titleKey: 'blog.art6Title', excerptKey: 'blog.art6Excerpt' },
]

const articles = computed(() => articleData.map(a => ({ ...a, title: t(a.titleKey), excerpt: t(a.excerptKey) })))

const categoryKeys = ['all', 'tips', 'destinations', 'preparation', 'safety', 'guides'] as const
const categoryLabels: Record<string, string> = {
  all: 'blog.all', tips: 'blog.tips', destinations: 'blog.destinationsTag',
  preparation: 'blog.preparation', safety: 'blog.safety', guides: 'blog.guides',
}
const activeCategory = ref('all')

const filtered = computed(() =>
  activeCategory.value === 'all'
    ? articles.value
    : articles.value.filter(a => a.category === activeCategory.value)
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="bg-gray-950 text-white py-14 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" aria-hidden="true">
        <svg viewBox="0 0 1200 300" class="w-full h-full" preserveAspectRatio="none">
          <path d="M-50,200 Q300,50 600,150 Q900,250 1250,50" fill="none" stroke="white" stroke-width="1" class="flight-path"/>
        </svg>
      </div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        </div>
        <h1 class="text-3xl font-black mb-3">{{ t('blog.title') }}</h1>
        <p class="text-gray-400">{{ t('blog.subtitle') }}</p>
      </div>
    </div>

  <div class="max-w-4xl mx-auto px-4 py-12">

    <!-- Category filter -->
    <div role="group" :aria-label="t('blog.filterGroupLabel')" class="flex gap-2 flex-wrap justify-center mb-8">
      <button v-for="cat in categoryKeys" :key="cat"
        @click="activeCategory = cat"
        :aria-pressed="activeCategory === cat"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all border"
        :class="activeCategory === cat
          ? 'bg-brand-600 text-white border-brand-600'
          : 'border-gray-200 text-gray-600 hover:border-brand-300 bg-white'">
        {{ t(categoryLabels[cat]) }}
      </button>
    </div>

    <!-- Featured article -->
    <article v-if="activeCategory === 'all'" class="relative text-white rounded-2xl mb-8 overflow-hidden">
      <DestinationPhoto code="IST" :width="1200" height-class="absolute inset-0" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent"></div>
      <NuxtLink :to="`/blog/${articles[0].slug}`" class="block p-8 relative z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-950 rounded-2xl">
        <span class="text-xs bg-brand-600 px-3 py-1 rounded-full font-bold tracking-wider">{{ t('blog.featured').toUpperCase() }}</span>
        <div aria-hidden="true" class="text-5xl my-4">{{ articles[0].emoji }}</div>
        <h2 class="text-2xl font-black mb-3 hover:underline">{{ articles[0].title }}</h2>
        <p class="text-gray-400 mb-5 leading-relaxed">{{ articles[0].excerpt }}</p>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span><time :datetime="articles[0].date">{{ formatDate(articles[0].date) }}</time></span>
          <span aria-hidden="true">·</span>
          <span>{{ articles[0].readTime }} {{ t('blog.readTime') }}</span>
          <span class="ml-auto font-bold text-brand-400">{{ t('blog.readMore') }} <span aria-hidden="true">→</span></span>
        </div>
      </NuxtLink>
    </article>

    <!-- Article grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <article v-for="article in (activeCategory === 'all' ? filtered.slice(1) : filtered)" :key="article.slug"
        class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all group">
        <NuxtLink :to="`/blog/${article.slug}`" class="block p-6 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-2xl">
          <div aria-hidden="true" class="text-3xl mb-3">{{ article.emoji }}</div>
          <span class="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded-full">{{ t(categoryLabels[article.category] || article.category) }}</span>
          <h3 class="text-lg font-bold text-gray-900 mt-3 mb-2 group-hover:text-brand-600 transition-colors leading-tight">
            {{ article.title }}
          </h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ article.excerpt }}</p>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <time :datetime="article.date">{{ formatDate(article.date) }}</time>
            <span class="flex items-center gap-1 text-brand-600 font-medium group-hover:gap-2 transition-all">
              {{ t('blog.readMore') }} <span aria-hidden="true">→</span>
            </span>
          </div>
        </NuxtLink>
      </article>
    </div>

    <!-- CTA -->
    <div class="mt-12 text-center bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl p-8 border border-brand-100">
      <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-100 flex items-center justify-center">
        <svg class="w-7 h-7 text-brand-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('blog.ctaTitle') }}</h3>
      <p class="text-gray-500 text-sm mb-5">{{ t('blog.ctaSubtitle') }}</p>
      <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
        {{ t('search.searchButton') }}
      </NuxtLink>
    </div>
  </div>
  </div>
</template>
