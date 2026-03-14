<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('luggage.title'), description: t('luggage.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('luggage.title'), url: '/luggage' },
])

const airlines = computed(() => [
  {
    name: 'Wizz Air',
    code: 'W6',
    personal: { size: '40×30×20 cm', weight: 'max 10 kg', note: t('luggage.allFares') },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: '€10–25', note: t('luggage.plusAndPriority') },
    checked: { weight: '20 kg', fee: '€20–50', note: t('luggage.perFlight') },
  },
  {
    name: 'Ryanair',
    code: 'FR',
    personal: { size: '40×20×25 cm', weight: t('luggage.noWeight'), note: t('luggage.underSeat') },
    cabin: { size: '55×40×20 cm', weight: 'max 10 kg', fee: '€10–30', note: t('luggage.priorityOrBags') },
    checked: { weight: '20 kg / 15 kg', fee: '€12–40', note: t('luggage.bookedOnline') },
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
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div aria-hidden="true" class="text-5xl mb-4">🧳</div>
      <h1 class="text-4xl font-extrabold mb-3">{{ t('luggage.title') }}</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">{{ t('luggage.subtitle') }}</p>
    </div>

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

      <div class="text-center">
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          <span aria-hidden="true">✈</span> {{ t('luggage.cta') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
