<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('faq.title'), description: t('faq.subtitle') })

const openFaq = ref<number | null>(null)
const faqSearch = ref('')

function toggle(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

const faqs = computed(() => [
  { q: t('faq.q1'), a: t('faq.a1') },
  { q: t('faq.q2'), a: t('faq.a2') },
  { q: t('faq.q3'), a: t('faq.a3') },
  { q: t('faq.q4'), a: t('faq.a4') },
  { q: t('faq.q5'), a: t('faq.a5') },
  { q: t('faq.q6'), a: t('faq.a6') },
  { q: t('faq.q7'), a: t('faq.a7') },
  { q: t('faq.q8'), a: t('faq.a8') },
  { q: t('faq.q9'), a: t('faq.a9') },
  { q: t('faq.q10'), a: t('faq.a10') },
])

useFAQStructuredData(faqs.value.map(f => ({ question: f.q, answer: f.a })))
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('faq.title'), url: '/faq' },
])
</script>

<template>
  <div>
    <div class="bg-gray-950 text-white py-14 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" aria-hidden="true">
        <svg viewBox="0 0 1200 300" class="w-full h-full" preserveAspectRatio="none">
          <path d="M-50,200 Q300,50 600,150 Q900,250 1250,50" fill="none" stroke="white" stroke-width="1" class="flight-path"/>
        </svg>
      </div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h1 class="text-3xl font-black mb-3">{{ t('faq.title') }}</h1>
        <p class="text-gray-400">{{ t('faq.subtitle') }}</p>
      </div>
    </div>
  <div class="max-w-3xl mx-auto px-4 py-12">

    <!-- Search FAQ -->
    <div class="mb-6">
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="faqSearch" type="text" :placeholder="t('faq.searchPlaceholder')"
          class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          :aria-label="t('faq.searchPlaceholder')" />
      </div>
    </div>

    <div class="space-y-3">
      <div v-for="(faq, i) in faqs.filter(f => !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase()))" :key="i"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all">
        <button @click="toggle(i)"
          :id="`faq-btn-${i}`"
          :aria-expanded="openFaq === i"
          :aria-controls="`faq-answer-${i}`"
          class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
          <span class="font-semibold text-gray-900">{{ faq.q }}</span>
          <span aria-hidden="true" class="text-brand-600 shrink-0 text-xl transition-transform duration-200"
            :class="openFaq === i ? 'rotate-45' : ''">+</span>
        </button>
        <div v-if="openFaq === i" :id="`faq-answer-${i}`" role="region" :aria-labelledby="`faq-btn-${i}`" class="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {{ faq.a }}
        </div>
      </div>
    </div>

    <div class="mt-10 bg-brand-50 rounded-2xl p-6 text-center">
      <p class="text-gray-700 mb-4">{{ t('faq.stillHelp') }}</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <a href="tel:+37322000000"
          class="px-5 py-2.5 border border-brand-300 text-brand-700 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors">
          <span aria-hidden="true">📞</span> +373 22 000 000
        </a>
        <a href="mailto:support@youfly.md"
          class="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
          <span aria-hidden="true">✉️</span> {{ t('faq.contactUs') }}
        </a>
      </div>
    </div>

    <!-- Related resources -->
    <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
      <NuxtLink v-for="link in [
        { to: '/checkin', icon: '🎫', label: t('nav.checkin') },
        { to: '/luggage', icon: '🧳', label: t('nav.luggage') },
        { to: '/visa', icon: '🛂', label: t('nav.visa') },
        { to: '/blog', icon: '📖', label: t('nav.blog') },
      ]" :key="link.to" :to="link.to"
        class="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-3 hover:border-brand-400 transition-colors text-sm font-medium text-gray-700 hover:text-brand-600">
        <span aria-hidden="true">{{ link.icon }}</span>
        {{ link.label }}
      </NuxtLink>
    </div>
  </div>
  </div>
</template>
