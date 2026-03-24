<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('luggage.title'), description: t('luggage.seoDesc') })
useReveal()
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('luggage.title'), url: '/luggage' },
])

// Article structured data for baggage guide
useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: t('luggage.title'),
  description: t('luggage.seoDesc'),
  author: { '@type': 'Organization', name: 'YouFly' },
  publisher: { '@type': 'Organization', name: 'YouFly', url: 'https://youfly-xi.vercel.app' },
})

const airlines = computed(() => [
  {
    name: 'Wizz Air',
    code: 'W6',
    personal: { size: '40×30×20 cm', weight: 'max 10 kg', note: t('luggage.allFares') },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: '€10–25', note: t('luggage.plusAndPriority') },
    checked: { weight: '20 kg', fee: '€20–50', note: t('luggage.perFlight') },
  },
  {
    name: 'FlyOne',
    code: '5F',
    personal: { size: '40×30×20 cm', weight: t('luggage.noWeight'), note: t('luggage.underSeat') },
    cabin: { size: '55×40×20 cm', weight: 'max 8 kg', fee: t('luggage.dependsOnFare'), note: t('luggage.dependsOnFare') },
    checked: { weight: '20 kg', fee: '€20–35', note: t('luggage.bookedOnline') },
  },
  {
    name: 'Turkish Airlines',
    code: 'TK',
    personal: { size: t('luggage.noLimit'), weight: '', note: t('luggage.includedInCabin') },
    cabin: { size: '55×40×23 cm', weight: 'max 8 kg', fee: t('luggage.included'), note: t('luggage.economyFare') },
    checked: { weight: `20 kg (${t('search.economy')})`, fee: t('luggage.included'), note: t('luggage.economyIncludes') },
  },
  {
    name: 'Austrian Airlines',
    code: 'OS',
    personal: { size: '40×30×15 cm', weight: 'max 8 kg', note: t('luggage.frontUnderSeat') },
    cabin: { size: '55×40×20 cm', weight: 'max 8 kg', fee: t('luggage.included'), note: t('luggage.included') },
    checked: { weight: '23 kg', fee: t('luggage.inclOrFee'), note: t('luggage.dependsOnFare') },
  },
  {
    name: 'LOT Polish Airlines',
    code: 'LO',
    personal: { size: '40×35×20 cm', weight: 'max 5 kg', note: t('luggage.included') },
    cabin: { size: '55×40×23 cm', weight: 'max 8 kg', fee: t('luggage.included'), note: t('luggage.included') },
    checked: { weight: '23 kg', fee: t('luggage.inclOrFee20'), note: t('luggage.econLightFee') },
  },
  {
    name: 'HiSky',
    code: 'H4',
    personal: { size: '40×30×20 cm', weight: 'max 5 kg', note: t('luggage.underSeat') },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: t('luggage.dependsOnFare'), note: t('luggage.dependsOnFare') },
    checked: { weight: '23 kg', fee: '€15–30', note: t('luggage.bookedOnline') },
  },
  {
    name: 'Lufthansa',
    code: 'LH',
    personal: { size: '40×30×10 cm', weight: t('luggage.noWeight'), note: t('luggage.underSeat') },
    cabin: { size: '55×40×23 cm', weight: 'max 8 kg', fee: t('luggage.included'), note: t('luggage.allFares') },
    checked: { weight: '23 kg', fee: t('luggage.inclOrFee'), note: t('luggage.dependsOnFare') },
  },
])

const prohibitedItems = computed(() => [
  { cat: t('luggage.prohib_Liquids'), rule: t('luggage.prohib_LiquidsRule'), icon: '💧' },
  { cat: t('luggage.prohib_Batteries'), rule: t('luggage.prohib_BatteriesRule'), icon: '🔋' },
  { cat: t('luggage.prohib_Sharp'), rule: t('luggage.prohib_SharpRule'), icon: '🔪' },
  { cat: t('luggage.prohib_Sprays'), rule: t('luggage.prohib_SpraysRule'), icon: '🫧' },
  { cat: t('luggage.prohib_Explosives'), rule: t('luggage.prohib_ExplosivesRule'), icon: '💣' },
  { cat: t('luggage.prohib_Magnets'), rule: t('luggage.prohib_MagnetsRule'), icon: '🧲' },
])
</script>

<template>
  <div>
    <DestinationPhoto code="MXP" :width="1200" height-class="relative text-white py-16 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/80"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <h1 class="text-4xl font-black mb-3">{{ t('luggage.title') }}</h1>
        <p class="text-gray-400 text-lg max-w-xl mx-auto">{{ t('luggage.subtitle') }}</p>
      </div>
    </DestinationPhoto>

    <div class="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <!-- Quick tips -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="tip in [
          { icon: '📏', title: t('luggage.tip1Title'), desc: t('luggage.tip1Desc') },
          { icon: '⚖️', title: t('luggage.tip2Title'), desc: t('luggage.tip2Desc') },
          { icon: '🏷️', title: t('luggage.tip3Title'), desc: t('luggage.tip3Desc') },
        ]" :key="tip.title"
          class="bg-white rounded-2xl border border-gray-200 p-5">
          <div aria-hidden="true" class="text-3xl mb-3">{{ tip.icon }}</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ tip.title }}</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ tip.desc }}</p>
        </div>
      </div>

      <!-- Airlines table -->
      <section aria-labelledby="luggage-policies-title">
        <h2 id="luggage-policies-title" class="text-2xl font-bold text-gray-900 mb-4">{{ t('luggage.policiesTitle') }}</h2>
        <div class="space-y-4">
          <div v-for="a in airlines" :key="a.code"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
              <span class="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{{ a.code }}</span>
              <h3 class="font-semibold text-gray-900">{{ a.name }}</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2"><span aria-hidden="true">👜</span> {{ t('luggage.personal') }}</p>
                <p class="text-sm font-medium text-gray-900">{{ a.personal.size }}</p>
                <p v-if="a.personal.weight" class="text-sm text-gray-600">{{ a.personal.weight }}</p>
                <p class="text-xs text-green-600 mt-1">{{ a.personal.note }}</p>
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2"><span aria-hidden="true">🎒</span> {{ t('luggage.cabin') }}</p>
                <p class="text-sm font-medium text-gray-900">{{ a.cabin.size }}</p>
                <p class="text-sm text-gray-600">{{ a.cabin.weight }}</p>
                <p class="text-xs text-brand-600 mt-1 font-medium">{{ a.cabin.fee }}</p>
                <p class="text-xs text-gray-500">{{ a.cabin.note }}</p>
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase mb-2"><span aria-hidden="true">🧳</span> {{ t('luggage.checked') }}</p>
                <p class="text-sm font-medium text-gray-900">{{ a.checked.weight }}</p>
                <p class="text-xs text-brand-600 mt-1 font-medium">{{ a.checked.fee }}</p>
                <p class="text-xs text-gray-500">{{ a.checked.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Prohibited items -->
      <section aria-labelledby="luggage-prohibited-title">
        <h2 id="luggage-prohibited-title" class="text-2xl font-bold text-gray-900 mb-4">{{ t('luggage.prohibitedTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="item in prohibitedItems" :key="item.cat"
            class="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
            <span aria-hidden="true" class="text-2xl shrink-0">{{ item.icon }}</span>
            <div>
              <h4 class="font-semibold text-gray-900 text-sm mb-1">{{ item.cat }}</h4>
              <p class="text-xs text-gray-600 leading-relaxed">{{ item.rule }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Packing tips -->
      <div class="bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border border-brand-100 p-6 reveal">
        <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span aria-hidden="true" class="w-6 h-6 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </span>
          {{ t('luggage.packingTitle') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div v-for="i in 6" :key="i" class="flex items-start gap-2">
            <svg aria-hidden="true" class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            {{ t('luggage.pack' + i) }}
          </div>
        </div>
      </div>

      <div class="text-center">
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors glow-cta">
          <span aria-hidden="true">✈</span> {{ t('luggage.cta') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
