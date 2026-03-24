<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('about.title'), description: t('about.subtitle') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('about.title'), url: '/about' },
])

useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'YouFly',
    url: 'https://youfly-xi.vercel.app',
    description: t('about.subtitle'),
    address: { '@type': 'PostalAddress', addressLocality: 'Chișinău', addressCountry: 'MD' },
    contactPoint: { '@type': 'ContactPoint', telephone: '+373 22 000 000', contactType: 'customer service', availableLanguage: ['Romanian', 'Russian', 'English'] },
  },
})
</script>

<template>
  <div>
    <!-- Hero -->
    <DestinationPhoto code="CDG" :width="1200" height-class="relative text-white py-20 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/80"></div>
      <div class="relative z-10 max-w-2xl mx-auto">
        <p class="text-brand-400 text-sm font-semibold uppercase tracking-[0.3em] mb-4">{{ t('about.title') }}</p>
        <h1 class="text-4xl md:text-5xl font-black mb-4">{{ t('about.title') }}</h1>
        <p class="text-lg text-gray-400 leading-relaxed">{{ t('about.subtitle') }}</p>
      </div>
    </DestinationPhoto>

  <div class="max-w-4xl mx-auto px-4 py-12">

    <!-- Mission -->
    <div class="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ t('about.mission') }}</h2>
      <p class="text-gray-700 text-lg leading-relaxed">{{ t('about.missionText') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      <div v-for="stat in [
        { number: '25+', label: t('about.stat1Label') },
        { number: '77+', label: t('about.stat2Label') },
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
          { svg: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'brand', title: t('about.step1'), desc: t('about.step1Desc') },
          { svg: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', color: 'emerald', title: t('about.step2'), desc: t('about.step2Desc') },
          { svg: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', color: 'amber', title: t('about.step3'), desc: t('about.step3Desc') },
        ]" :key="i"
          class="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm card-premium">
          <div class="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            :class="step.color === 'brand' ? 'bg-brand-50' : step.color === 'emerald' ? 'bg-emerald-50' : 'bg-amber-50'">
            <svg class="w-7 h-7" :class="step.color === 'brand' ? 'text-brand-600' : step.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="step.svg"/></svg>
          </div>
          <div class="text-sm font-black text-brand-600 uppercase tracking-widest mb-2">{{ t('about.stepLabel') }} {{ i + 1 }}</div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
          <p class="text-sm text-gray-500">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Why Moldova -->
    <div class="relative bg-gray-950 text-white rounded-3xl p-8 mb-8 overflow-hidden">
      <DestinationPhoto code="RMO" :width="800" height-class="absolute inset-0 opacity-20" :no-animation="true" />
      <div class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-950/60"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-4">
          <span aria-hidden="true" class="text-4xl">🇲🇩</span>
          <h2 class="text-2xl font-black">{{ t('about.madeInMoldova') }}</h2>
        </div>
        <p class="text-gray-400 leading-relaxed mb-4">{{ t('about.madeInMoldovaDesc') }}</p>
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-black text-brand-400">25</div>
            <div class="text-xs text-gray-500">{{ t('about.airlinesFromRMO') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-black text-brand-400">77+</div>
            <div class="text-xs text-gray-500">{{ t('about.stat2Label') }}</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-black text-brand-400">3</div>
            <div class="text-xs text-gray-500">{{ t('nav.switchLanguage') }}</div>
          </div>
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

    <!-- Airlines we work with -->
    <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ t('about.airlinesTitle') }}</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="airline in ['Wizz Air','Turkish Airlines','TAROM','Austrian Airlines','LOT Polish Airlines','Lufthansa','FlyOne','HiSky','flydubai','Aegean Airlines','airBaltic','Pegasus Airlines','El Al','SkyUp Airlines','Eurowings','AZAL','Freebird Airlines']"
          :key="airline" class="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-100 hover:border-brand-300 hover:text-brand-600 transition-colors cursor-default">
          {{ airline }}
        </span>
      </div>
      <p class="text-xs text-gray-400 mt-3">{{ t('about.airlinesNote') }}</p>
    </div>

    <!-- CTA -->
    <div class="text-center">
      <NuxtLink to="/"
        class="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg glow-cta">
        {{ t('about.cta') }}
      </NuxtLink>
    </div>
  </div>
  </div>
</template>
