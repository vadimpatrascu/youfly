<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('checkin.title'), description: t('checkin.seoDesc') })
useReveal()
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('checkin.title'), url: '/checkin' },
])

// HowTo structured data for check-in process
useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: t('checkin.title'),
  description: t('checkin.seoDesc'),
  step: [
    { '@type': 'HowToStep', position: 1, name: t('checkin.step1Title'), text: t('checkin.step1Desc') },
    { '@type': 'HowToStep', position: 2, name: t('checkin.step2Title'), text: t('checkin.step2Desc') },
    { '@type': 'HowToStep', position: 3, name: t('checkin.step3Title'), text: t('checkin.step3Desc') },
    { '@type': 'HowToStep', position: 4, name: t('checkin.step4Title'), text: t('checkin.step4Desc') },
  ],
})

const airlines = computed(() => [
  { name: 'Wizz Air', code: 'W6', window: t('checkin.airlineW6'), url: 'https://wizzair.com', checkin: '100%', fee: t('checkin.feeW6') },
  { name: 'Turkish Airlines', code: 'TK', window: t('checkin.airlineTK'), url: 'https://turkishairlines.com', checkin: '95%', fee: t('checkin.feeTK') },
  { name: 'FlyOne', code: '5F', window: '24h — 3h', url: 'https://flyone.eu', checkin: '92%', fee: 'Gratuit' },
  { name: 'Austrian Airlines', code: 'OS', window: t('checkin.airlineOS'), url: 'https://austrian.com', checkin: '88%', fee: t('checkin.feeOS') },
  { name: 'LOT Polish Airlines', code: 'LO', window: t('checkin.airlineLO'), url: 'https://lot.com', checkin: '85%', fee: t('checkin.feeLO') },
  { name: 'Lufthansa', code: 'LH', window: t('checkin.airlineLH'), url: 'https://lufthansa.com', checkin: '90%', fee: t('checkin.feeLH') },
])

const steps = computed(() => [
  { n: 1, title: t('checkin.step1Title'), desc: t('checkin.step1Desc'), svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-500' },
  { n: 2, title: t('checkin.step2Title'), desc: t('checkin.step2Desc'), svgPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1', color: 'text-purple-500' },
  { n: 3, title: t('checkin.step3Title'), desc: t('checkin.step3Desc'), svgPath: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', color: 'text-brand-500', fill: true },
  { n: 4, title: t('checkin.step4Title'), desc: t('checkin.step4Desc'), svgPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', color: 'text-green-500' },
])

const checklistItems = computed(() => [
  t('checkin.checklist1'),
  t('checkin.checklist2'),
  t('checkin.checklist3'),
  t('checkin.checklist4'),
  t('checkin.checklist5'),
  t('checkin.checklist6'),
  t('checkin.checklist7'),
  t('checkin.checklist8'),
])

const tips = computed(() => [
  t('checkin.tip1'),
  t('checkin.tip2'),
  t('checkin.tip3'),
  t('checkin.tip4'),
  t('checkin.tip5'),
])
</script>

<template>
  <div>
    <!-- Hero -->
    <DestinationPhoto code="LTN" :width="1200" height-class="relative text-white py-16 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/80"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
        </div>
        <h1 class="text-4xl font-black mb-3">{{ t('checkin.title') }}</h1>
        <p class="text-gray-400 text-lg max-w-xl mx-auto">{{ t('checkin.subtitle') }}</p>
      </div>
    </DestinationPhoto>

    <div class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <!-- Free check-in promo banner (inspired by zbor.md) -->
      <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 flex items-center gap-4 flex-wrap reveal">
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div class="flex-1 min-w-[200px]">
          <h2 class="font-black text-lg mb-1">{{ t('checkin.promoTitle') }}</h2>
          <p class="text-green-100 text-sm">{{ t('checkin.promoDesc') }}</p>
        </div>
        <div class="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center shrink-0">
          <div class="text-2xl font-black">{{ t('checkin.promoFree') }}</div>
          <div class="text-xs text-green-200">{{ t('checkin.promoVs') }}</div>
        </div>
      </div>

      <!-- How to check in -->
      <section aria-labelledby="checkin-steps-title" class="reveal">
        <h2 id="checkin-steps-title" class="text-2xl font-bold text-gray-900 mb-6">{{ t('checkin.stepsTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(step, si) in steps" :key="step.n"
            class="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 reveal" :style="`transition-delay: ${si * 0.08}s`">
            <div aria-hidden="true" class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <svg :class="['w-5 h-5', step.color]" :fill="step.fill ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="step.svgPath"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">{{ step.n }}</span>
                <h3 class="font-semibold text-gray-900">{{ step.title }}</h3>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Airlines table -->
      <section aria-labelledby="checkin-windows-title">
        <h2 id="checkin-windows-title" class="text-2xl font-bold text-gray-900 mb-6">{{ t('checkin.windowsTitle') }}</h2>
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" class="text-left px-5 py-3 font-semibold text-gray-700">{{ t('checkin.airline') }}</th>
                  <th scope="col" class="text-left px-5 py-3 font-semibold text-gray-700">{{ t('checkin.window') }}</th>
                  <th scope="col" class="text-left px-5 py-3 font-semibold text-gray-700">{{ t('checkin.fee') }}</th>
                  <th scope="col" class="px-5 py-3"><span class="sr-only">{{ t('checkin.checkInBtn') }}</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="a in airlines" :key="a.code" class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{{ a.code }}</span>
                      <span class="font-medium text-gray-900">{{ a.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-gray-600">{{ a.window }}</td>
                  <td class="px-5 py-4">
                    <span :class="a.code !== 'FR' ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'"
                      class="text-xs px-2 py-1 rounded-full font-medium">
                      {{ a.fee }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <a :href="a.url" target="_blank" rel="noopener noreferrer"
                      :aria-label="t('checkin.checkInBtnLabel', { airline: a.name })"
                      class="text-xs text-brand-600 hover:underline font-medium">{{ t('checkin.checkInBtn') }} <span aria-hidden="true">→</span></a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tips -->
      <section aria-labelledby="checkin-tips-title" class="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 id="checkin-tips-title" class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span aria-hidden="true" class="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-3.5 13.06V17a1 1 0 001 1h5a1 1 0 001-1v-1.94A7 7 0 0012 2zm1 14h-2v-1h2v1zm0-3h-2V9h2v4z"/></svg>
          </span>
          {{ t('checkin.tipsTitle') }}
        </h3>
        <ul class="space-y-2">
          <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
            <span aria-hidden="true" class="text-amber-500 shrink-0 mt-0.5">•</span>
            {{ tip }}
          </li>
        </ul>
      </section>

      <!-- Pre-flight checklist -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 reveal">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span aria-hidden="true" class="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </span>
          {{ t('checkin.preflightTitle') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <label v-for="item in checklistItems" :key="item" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
            <input type="checkbox" class="rounded border-gray-300 text-brand-600 focus:ring-brand-500 shrink-0" />
            <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ item }}</span>
          </label>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <p class="text-gray-500 text-sm mb-4">{{ t('checkin.cta') }}</p>
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          <span aria-hidden="true">✈</span> {{ t('search.searchButton') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
