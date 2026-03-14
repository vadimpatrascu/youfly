<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('faq.title'), description: t('faq.subtitle') })

const openFaq = ref<number | null>(null)

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
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <div aria-hidden="true" class="text-5xl mb-4">❓</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('faq.title') }}</h1>
      <p class="text-gray-500">{{ t('faq.subtitle') }}</p>
    </div>

    <div class="space-y-3">
      <div v-for="(faq, i) in faqs" :key="i"
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
  </div>
</template>
