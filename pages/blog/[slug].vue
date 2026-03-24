<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const articleData = [
  { slug: 'cum-sa-gasesti-bilete-ieftine', date: '2026-03-10', readTime: '5', category: 'tips', emoji: '💰', scene: 'BCN', titleKey: 'blog.art1Title', excerptKey: 'blog.art1Excerpt', bodyKey: 'blog.art1Body' },
  { slug: 'top-destinatii-moldova', date: '2026-03-05', readTime: '7', category: 'destinations', emoji: '🌍', scene: 'IST', titleKey: 'blog.art2Title', excerptKey: 'blog.art2Excerpt', bodyKey: 'blog.art2Body' },
  { slug: 'bagaj-de-mana-ghid-complet', date: '2026-02-28', readTime: '8', category: 'preparation', emoji: '🎒', scene: 'VIE', titleKey: 'blog.art3Title', excerptKey: 'blog.art3Excerpt', bodyKey: 'blog.art3Body' },
  { slug: 'rezervare-cu-escala-vs-direct', date: '2026-02-20', readTime: '6', category: 'tips', emoji: '✈️', scene: 'CDG', titleKey: 'blog.art4Title', excerptKey: 'blog.art4Excerpt', bodyKey: 'blog.art4Body' },
  { slug: 'asigurare-calatorie-de-ce', date: '2026-02-15', readTime: '5', category: 'safety', emoji: '🛡️', scene: 'LTN', titleKey: 'blog.art5Title', excerptKey: 'blog.art5Excerpt', bodyKey: 'blog.art5Body' },
  { slug: 'istanbul-ghid-3-zile', date: '2026-02-10', readTime: '10', category: 'guides', emoji: '🕌', scene: 'IST', titleKey: 'blog.art6Title', excerptKey: 'blog.art6Excerpt', bodyKey: 'blog.art6Body' },
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

async function shareArticle() {
  if (!article.value) return
  const url = window.location.href
  const text = `${article.value.title} — YouFly Blog`
  if (navigator.share) {
    try { await navigator.share({ title: text, url }) } catch {}
  } else {
    try { await navigator.clipboard.writeText(url) } catch {}
  }
}
</script>

<template>
  <div>
    <!-- Immersive article hero -->
    <DestinationPhoto v-if="article" :code="article.scene" :width="1200" height-class="relative text-white">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/80"></div>
      <div class="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-12">
        <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
          <span aria-hidden="true">←</span> {{ t('blog.backToBlog') }}
        </NuxtLink>
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <span class="text-xs text-brand-400 font-bold bg-brand-500/20 px-2.5 py-1 rounded-full border border-brand-500/20">
            {{ t(categoryLabels[article.category] || article.category) }}
          </span>
        </div>
        <h1 class="text-3xl font-black mb-4 leading-tight">{{ article.title }}</h1>
        <p class="text-gray-400 leading-relaxed mb-4">{{ article.excerpt }}</p>
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ article.readTime }} {{ t('blog.readTime') }}</span>
        </div>
      </div>
    </DestinationPhoto>

  <div class="max-w-2xl mx-auto px-4 py-12">

    <!-- Not found -->
    <div v-if="!article" class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('blog.notFound') }}</h1>
      <p class="text-gray-500 mb-6">{{ t('blog.notFoundSub') }}</p>
      <NuxtLink to="/blog" class="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">
        {{ t('blog.ctaMoreArticles') }}
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else>

      <!-- Body -->
      <div class="space-y-4 text-gray-700 leading-relaxed text-base">
        <p v-for="(para, i) in article.body.split('\n\n').filter(Boolean)" :key="i">{{ para }}</p>
      </div>

      <!-- Share strip -->
      <div class="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <span class="text-xs text-gray-400">{{ article.readTime }} {{ t('blog.readTime') }} · {{ formatDate(article.date) }}</span>
        <button @click="shareArticle" class="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          {{ t('confirm.shareBooking') }}
        </button>
      </div>

      <!-- CTA -->
      <div class="mt-10 bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-brand-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>
        <h3 class="font-bold text-gray-900 mb-2">{{ t('blog.ctaTitle') }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ t('blog.ctaSubtitle') }}</p>
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          {{ t('search.searchButton') }}
        </NuxtLink>
      </div>

      <!-- Next/Previous article navigation -->
      <div class="mt-8 grid grid-cols-2 gap-3">
        <NuxtLink v-if="articleData.findIndex(a => a.slug === route.params.slug) > 0"
          :to="`/blog/${articleData[articleData.findIndex(a => a.slug === route.params.slug) - 1].slug}`"
          class="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors group text-left">
          <span class="text-xs text-gray-400">{{ t('blog.prevArticle') }}</span>
          <p class="text-sm font-semibold text-gray-800 group-hover:text-brand-600 mt-1 line-clamp-2">
            {{ t(articleData[articleData.findIndex(a => a.slug === route.params.slug) - 1].titleKey) }}
          </p>
        </NuxtLink>
        <div v-else></div>
        <NuxtLink v-if="articleData.findIndex(a => a.slug === route.params.slug) < articleData.length - 1"
          :to="`/blog/${articleData[articleData.findIndex(a => a.slug === route.params.slug) + 1].slug}`"
          class="bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors group text-right">
          <span class="text-xs text-gray-400">{{ t('blog.nextArticle') }}</span>
          <p class="text-sm font-semibold text-gray-800 group-hover:text-brand-600 mt-1 line-clamp-2">
            {{ t(articleData[articleData.findIndex(a => a.slug === route.params.slug) + 1].titleKey) }}
          </p>
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
  </div>
</template>
