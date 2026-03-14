<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('terms.title'), description: t('terms.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('terms.title'), url: '/terms' },
])
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('terms.title') }}</h1>
      <p class="text-gray-500 text-sm">{{ t('terms.lastUpdated') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
      <section aria-labelledby="terms-s1-title">
        <h2 id="terms-s1-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s1Title') }}</h2>
        <p>{{ t('terms.s1') }}</p>
      </section>

      <section aria-labelledby="terms-s2-title">
        <h2 id="terms-s2-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s2Title') }}</h2>
        <p>{{ t('terms.s2') }}</p>
      </section>

      <section aria-labelledby="terms-s3-title">
        <h2 id="terms-s3-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s3Title') }}</h2>
        <p>{{ t('terms.s3') }}</p>
      </section>

      <section aria-labelledby="terms-s4-title">
        <h2 id="terms-s4-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s4Title') }}</h2>
        <p>{{ t('terms.s4') }}</p>
      </section>

      <section aria-labelledby="terms-s5-title">
        <h2 id="terms-s5-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s5Title') }}</h2>
        <p>{{ t('terms.s5') }}</p>
      </section>

      <section aria-labelledby="terms-s6-title">
        <h2 id="terms-s6-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s6Title') }}</h2>
        <p>{{ t('terms.s6') }}</p>
      </section>

      <section aria-labelledby="terms-s7-title">
        <h2 id="terms-s7-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('terms.s7Title') }}</h2>
        <p>{{ t('terms.s7') }}</p>
      </section>
    </div>

    <div class="mt-6 text-center">
      <NuxtLink to="/" class="text-brand-600 hover:underline text-sm">{{ t('terms.backHome') }}</NuxtLink>
    </div>
  </div>
</template>
