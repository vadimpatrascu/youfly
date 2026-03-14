<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('visa.title'), description: t('visa.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('visa.title'), url: '/visa' },
])

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
  { type: 'evisa', label: t('visa.filterEvisa'), color: 'bg-purple-100 text-purple-700', icon: '💻' },
  { type: 'required', label: t('visa.filterRequired'), color: 'bg-red-100 text-red-700', icon: '!' },
])

const activeFilter = ref('all')
const filtered = computed(() =>
  activeFilter.value === 'all' ? destinations.value : destinations.value.filter(d => d.visa === activeFilter.value)
)
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div aria-hidden="true" class="text-5xl mb-4">🛂</div>
      <h1 class="text-4xl font-extrabold mb-3">{{ t('visa.title') }}</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">{{ t('visa.subtitle') }}</p>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-10">
      <!-- Important note -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex gap-3">
        <span aria-hidden="true" class="text-2xl shrink-0">⚠️</span>
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
