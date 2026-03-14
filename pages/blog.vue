<script setup lang="ts">
const { t, locale } = useI18n()
useSeo({ title: t('blog.title'), description: t('blog.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('nav.blog'), url: '/blog' },
])

const articleData = [
  { slug: 'cum-sa-gasesti-bilete-ieftine', date: '2025-03-10', readTime: '5 min', category: 'tips', emoji: '💰', titleKey: 'blog.art1Title', excerptKey: 'blog.art1Excerpt' },
  { slug: 'top-destinatii-moldova', date: '2025-03-05', readTime: '7 min', category: 'destinations', emoji: '🌍', titleKey: 'blog.art2Title', excerptKey: 'blog.art2Excerpt' },
  { slug: 'bagaj-de-mana-ghid-complet', date: '2025-02-28', readTime: '8 min', category: 'preparation', emoji: '🎒', titleKey: 'blog.art3Title', excerptKey: 'blog.art3Excerpt' },
  { slug: 'rezervare-cu-escala-vs-direct', date: '2025-02-20', readTime: '6 min', category: 'tips', emoji: '✈️', titleKey: 'blog.art4Title', excerptKey: 'blog.art4Excerpt' },
  { slug: 'asigurare-calatorie-de-ce', date: '2025-02-15', readTime: '5 min', category: 'safety', emoji: '🛡️', titleKey: 'blog.art5Title', excerptKey: 'blog.art5Excerpt' },
  { slug: 'istanbul-ghid-3-zile', date: '2025-02-10', readTime: '10 min', category: 'guides', emoji: '🕌', titleKey: 'blog.art6Title', excerptKey: 'blog.art6Excerpt' },
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
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('blog.title') }}</h1>
      <p class="text-gray-500 max-w-xl mx-auto">{{ t('blog.subtitle') }}</p>
    </div>

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
    <article v-if="activeCategory === 'all'" class="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl mb-8 overflow-hidden">
      <NuxtLink :to="`/blog/${articles[0].slug}`" class="block p-8 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-700 rounded-2xl">
        <span class="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">{{ t('blog.featured').toUpperCase() }}</span>
        <div aria-hidden="true" class="text-5xl my-4">{{ articles[0].emoji }}</div>
        <h2 class="text-2xl font-bold mb-3 hover:underline">{{ articles[0].title }}</h2>
        <p class="text-brand-200 mb-5 leading-relaxed">{{ articles[0].excerpt }}</p>
        <div class="flex items-center gap-4 text-sm text-brand-300">
          <span><time :datetime="articles[0].date">{{ formatDate(articles[0].date) }}</time></span>
          <span aria-hidden="true">·</span>
          <span>{{ articles[0].readTime }} {{ t('blog.readSuffix') }}</span>
          <span class="ml-auto font-semibold">{{ t('blog.readMore') }} <span aria-hidden="true">→</span></span>
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
    <div class="mt-12 text-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
      <div aria-hidden="true" class="text-4xl mb-3">✈️</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('blog.ctaTitle') }}</h3>
      <p class="text-gray-500 text-sm mb-5">{{ t('blog.ctaSubtitle') }}</p>
      <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
        {{ t('search.searchButton') }}
      </NuxtLink>
    </div>
  </div>
</template>
