<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('visa.title'), description: t('visa.seoDesc') })
useReveal()
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('visa.title'), url: '/visa' },
])

useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: t('visa.title'),
  description: t('visa.seoDesc'),
  author: { '@type': 'Organization', name: 'YouFly' },
  publisher: { '@type': 'Organization', name: 'YouFly', url: 'https://youfly-xi.vercel.app' },
})

const destData = [
  { code: 'EU', flag: '🇪🇺', visa: 'free', cat: 'Europe' },
  { code: 'TR', flag: '🇹🇷', visa: 'free', cat: 'Asia' },
  { code: 'IL', flag: '🇮🇱', visa: 'free', cat: 'MiddleEast' },
  { code: 'GB', flag: '🇬🇧', visa: 'required', cat: 'Europe' },
  { code: 'US', flag: '🇺🇸', visa: 'required', cat: 'America' },
  { code: 'CA', flag: '🇨🇦', visa: 'required', cat: 'America' },
  { code: 'JP', flag: '🇯🇵', visa: 'free', cat: 'Asia' },
  { code: 'AE', flag: '🇦🇪', visa: 'arrival', cat: 'MiddleEast' },
  { code: 'TH', flag: '🇹🇭', visa: 'free', cat: 'Asia' },
  { code: 'EG', flag: '🇪🇬', visa: 'arrival', cat: 'Africa' },
  { code: 'GE', flag: '🇬🇪', visa: 'free', cat: 'EasternEurope' },
  { code: 'UA', flag: '🇺🇦', visa: 'free', cat: 'EasternEurope' },
  { code: 'AL', flag: '🇦🇱', visa: 'free', cat: 'Europe' },
  { code: 'RS', flag: '🇷🇸', visa: 'free', cat: 'Europe' },
  { code: 'CN', flag: '🇨🇳', visa: 'required', cat: 'Asia' },
  { code: 'IN', flag: '🇮🇳', visa: 'evisa', cat: 'Asia' },
]

const destinations = computed(() => destData.map(d => ({
  ...d,
  country: t(`visa.c_${d.code}`),
  stay: t(`visa.stay_${d.code}`),
  note: t(`visa.note_${d.code}`),
  category: t(`visa.cat_${d.cat}`),
})))

const visaTypes = computed(() => [
  { type: 'free', label: t('visa.filterFree'), color: 'bg-green-100 text-green-700', icon: '✓' },
  { type: 'arrival', label: t('visa.filterArrival'), color: 'bg-blue-100 text-blue-700', icon: '✈' },
  { type: 'evisa', label: t('visa.filterEvisa'), color: 'bg-purple-100 text-purple-700', icon: 'E' },
  { type: 'required', label: t('visa.filterRequired'), color: 'bg-red-100 text-red-700', icon: '!' },
])

const activeFilter = ref('all')
const visaSearch = ref('')
const filtered = computed(() => {
  let list = activeFilter.value === 'all' ? destinations.value : destinations.value.filter(d => d.visa === activeFilter.value)
  if (visaSearch.value.trim()) {
    const q = visaSearch.value.toLowerCase()
    list = list.filter(d => d.country.toLowerCase().includes(q) || d.code.toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div>
    <DestinationPhoto code="VIE" :width="1200" height-class="relative text-white py-16 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/80"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"/></svg>
        </div>
        <h1 class="text-4xl font-black mb-3">{{ t('visa.title') }}</h1>
        <p class="text-gray-400 text-lg max-w-xl mx-auto">{{ t('visa.subtitle') }}</p>
      </div>
    </DestinationPhoto>

    <div class="max-w-4xl mx-auto px-4 py-10">
      <!-- Quick search -->
      <div class="mb-6">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="visaSearch" type="text" :placeholder="t('faq.searchPlaceholder')"
            class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
        </div>
      </div>

      <!-- Important note -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <p class="font-semibold text-amber-800 text-sm">{{ t('visa.infoNote') }}</p>
          <p class="text-amber-700 text-xs mt-1">{{ t('visa.infoNoteSub') }}</p>
        </div>
      </div>

      <!-- Filter by visa type -->
      <div role="group" :aria-label="t('visa.filterGroupLabel')" class="flex gap-2 flex-wrap mb-6">
        <button @click="activeFilter = 'all'"
          :aria-pressed="activeFilter === 'all'"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="activeFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'">
          {{ t('visa.filterAll') }} ({{ destinations.length }})
        </button>
        <button v-for="vt in visaTypes" :key="vt.type"
          @click="activeFilter = vt.type"
          :aria-pressed="activeFilter === vt.type"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="activeFilter === vt.type ? vt.color + ' border-transparent' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'">
          <span aria-hidden="true">{{ vt.icon }}</span> {{ vt.label }} ({{ destinations.filter(d => d.visa === vt.type).length }})
        </button>
      </div>

      <!-- Destination list -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="dest in filtered" :key="dest.country"
          class="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
          <div class="flex items-center gap-3">
            <span aria-hidden="true" class="text-2xl">{{ dest.flag }}</span>
            <div>
              <div class="font-medium text-gray-900 text-sm">{{ dest.country }}</div>
              <div class="text-xs text-gray-500">{{ dest.stay }} · {{ dest.note }}</div>
            </div>
          </div>
          <span class="text-xs px-3 py-1 rounded-full font-semibold shrink-0"
            :class="visaTypes.find(v => v.type === dest.visa)?.color || 'bg-gray-100 text-gray-600'">
            {{ visaTypes.find(v => v.type === dest.visa)?.label }}
          </span>
        </div>
      </div>

      <!-- EU section highlight -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2"><span aria-hidden="true">🇪🇺</span> {{ t('visa.schengenTitle') }}</h3>
        <p class="text-sm text-gray-700 leading-relaxed mb-3">{{ t('visa.schengenText') }}</p>
        <p class="text-xs text-gray-500">{{ t('visa.schengenNote') }}</p>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/" class="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
          <span aria-hidden="true">✈</span> {{ t('visa.cta') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
