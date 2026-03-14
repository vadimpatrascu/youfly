<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('privacy.title'), description: t('privacy.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('privacy.title'), url: '/privacy' },
])
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('privacy.title') }}</h1>
      <p class="text-gray-500 text-sm">{{ t('privacy.lastUpdated') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
      <section aria-labelledby="privacy-s1-title">
        <h2 id="privacy-s1-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s1Title') }}</h2>
        <p>{{ t('privacy.s1') }}</p>
      </section>

      <section aria-labelledby="privacy-s2-title">
        <h2 id="privacy-s2-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s2Title') }}</h2>
        <p>{{ t('privacy.s2Intro') }}</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>{{ t('privacy.s2L1') }}</li>
          <li>{{ t('privacy.s2L2') }}</li>
          <li>{{ t('privacy.s2L3') }}</li>
          <li>{{ t('privacy.s2L4') }}</li>
        </ul>
      </section>

      <section aria-labelledby="privacy-s3-title">
        <h2 id="privacy-s3-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s3Title') }}</h2>
        <p>{{ t('privacy.s3Intro') }}</p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          <li>{{ t('privacy.s3L1') }}</li>
          <li>{{ t('privacy.s3L2') }}</li>
        </ul>
        <p class="mt-2">{{ t('privacy.s3Note') }}</p>
      </section>

      <section aria-labelledby="privacy-s4-title">
        <h2 id="privacy-s4-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s4Title') }}</h2>
        <p>{{ t('privacy.s4') }}</p>
      </section>

      <section aria-labelledby="privacy-s5-title">
        <h2 id="privacy-s5-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s5Title') }}</h2>
        <p>{{ t('privacy.s5') }}</p>
      </section>

      <section aria-labelledby="privacy-s6-title">
        <h2 id="privacy-s6-title" class="text-lg font-bold text-gray-900 mb-3">{{ t('privacy.s6Title') }}</h2>
        <p>{{ t('privacy.s6') }}</p>
      </section>
    </div>

    <div class="mt-6 text-center">
      <NuxtLink to="/" class="text-brand-600 hover:underline text-sm">{{ t('privacy.backHome') }}</NuxtLink>
    </div>
  </div>
</template>
