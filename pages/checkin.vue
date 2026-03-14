<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('checkin.title'), description: t('checkin.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('checkin.title'), url: '/checkin' },
])

const airlines = computed(() => [
  { name: 'Wizz Air', code: 'W6', window: t('checkin.airlineW6'), url: 'https://wizzair.com', checkin: '100%', fee: t('checkin.feeW6') },
  { name: 'Turkish Airlines', code: 'TK', window: t('checkin.airlineTK'), url: 'https://turkishairlines.com', checkin: '95%', fee: t('checkin.feeTK') },
  { name: 'Ryanair', code: 'FR', window: t('checkin.airlineFR'), url: 'https://ryanair.com', checkin: '92%', fee: t('checkin.feeFR') },
  { name: 'Austrian Airlines', code: 'OS', window: t('checkin.airlineOS'), url: 'https://austrian.com', checkin: '88%', fee: t('checkin.feeOS') },
  { name: 'LOT Polish Airlines', code: 'LO', window: t('checkin.airlineLO'), url: 'https://lot.com', checkin: '85%', fee: t('checkin.feeLO') },
  { name: 'Lufthansa', code: 'LH', window: t('checkin.airlineLH'), url: 'https://lufthansa.com', checkin: '90%', fee: t('checkin.feeLH') },
])

const steps = computed(() => [
  { n: 1, title: t('checkin.step1Title'), desc: t('checkin.step1Desc'), icon: '📄' },
  { n: 2, title: t('checkin.step2Title'), desc: t('checkin.step2Desc'), icon: '💻' },
  { n: 3, title: t('checkin.step3Title'), desc: t('checkin.step3Desc'), icon: '✈️' },
  { n: 4, title: t('checkin.step4Title'), desc: t('checkin.step4Desc'), icon: '🎫' },
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
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div aria-hidden="true" class="text-5xl mb-4">🎫</div>
      <h1 class="text-4xl font-extrabold mb-3">{{ t('checkin.title') }}</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">{{ t('checkin.subtitle') }}</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <!-- How to check in -->
      <section aria-labelledby="checkin-steps-title">
        <h2 id="checkin-steps-title" class="text-2xl font-bold text-gray-900 mb-6">{{ t('checkin.stepsTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="step in steps" :key="step.n"
            class="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4">
            <div aria-hidden="true" class="text-3xl shrink-0">{{ step.icon }}</div>
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
          <span aria-hidden="true" class="text-xl">💡</span> {{ t('checkin.tipsTitle') }}
        </h3>
        <ul class="space-y-2">
          <li v-for="tip in tips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
            <span aria-hidden="true" class="text-amber-500 shrink-0 mt-0.5">•</span>
            {{ tip }}
          </li>
        </ul>
      </section>

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
