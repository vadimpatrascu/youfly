<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('about.title'), description: t('about.subtitle') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('about.title'), url: '/about' },
])
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- Hero -->
    <div class="text-center mb-16">
      <div aria-hidden="true" class="text-6xl mb-6">✈️</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ t('about.title') }}</h1>
      <p class="text-xl text-gray-500 max-w-2xl mx-auto">{{ t('about.subtitle') }}</p>
    </div>

    <!-- Mission -->
    <div class="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ t('about.mission') }}</h2>
      <p class="text-gray-700 text-lg leading-relaxed">{{ t('about.missionText') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div v-for="stat in [
        { number: t('about.stat1Val'), label: t('about.stat1Label') },
        { number: t('about.stat2Val'), label: t('about.stat2Label') },
        { number: t('about.stat3Val'), label: t('about.stat3Label') },
        { number: t('about.stat4Val'), label: t('about.stat4Label') },
      ]" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
        <div class="text-3xl font-black text-brand-600 mb-1">{{ stat.number }}</div>
        <div class="text-sm text-gray-500">{{ stat.label }}</div>
      </div>
    </div>

    <!-- How it works -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">{{ t('about.howItWorks') }}</h2>
      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="(step, i) in [
          { icon: '🔍', title: t('about.step1'), desc: t('about.step1Desc') },
          { icon: '✈️', title: t('about.step2'), desc: t('about.step2Desc') },
          { icon: '🎫', title: t('about.step3'), desc: t('about.step3Desc') },
        ]" :key="i"
          class="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
          <div aria-hidden="true" class="text-4xl mb-3">{{ step.icon }}</div>
          <div class="text-sm font-black text-brand-600 uppercase tracking-widest mb-2">{{ t('about.stepLabel') }} {{ i + 1 }}</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
          <p class="text-sm text-gray-500">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Technology -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ t('about.tech') }}</h2>
      <p class="text-gray-600 mb-4">{{ t('about.techText') }}</p>
      <div class="flex items-center gap-4 flex-wrap">
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Duffel API</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Nuxt.js 3</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Supabase</span>
        <span class="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-600">Vercel</span>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center">
      <NuxtLink to="/"
        class="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
        {{ t('about.cta') }}
      </NuxtLink>
    </div>
  </div>
</template>
