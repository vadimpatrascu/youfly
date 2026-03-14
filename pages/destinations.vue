<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()

useSeo({ title: t('destinations.title'), description: t('destinations.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('destinations.title'), url: '/destinations' },
])

const searchStore = useSearchStore()
const router = useRouter()
const searching = ref<string | null>(null)

const destData = [
  { code: 'OTP', flag: '🇷🇴', price: 35, emoji: '🏛️', pop: 5 },
  { code: 'IST', flag: '🇹🇷', price: 32, emoji: '🕌', pop: 5 },
  { code: 'LTN', flag: '🇬🇧', price: 39, emoji: '🎡', pop: 5 },
  { code: 'BCN', flag: '🇪🇸', price: 31, emoji: '🏖️', pop: 5 },
  { code: 'CDG', flag: '🇫🇷', price: 73, emoji: '🗼', pop: 5 },
  { code: 'VIE', flag: '🇦🇹', price: 39, emoji: '🎻', pop: 4 },
  { code: 'MXP', flag: '🇮🇹', price: 59, emoji: '🛍️', pop: 4 },
  { code: 'TLV', flag: '🇮🇱', price: 45, emoji: '🌊', pop: 4 },
  { code: 'BEG', flag: '🇷🇸', price: 28, emoji: '🏰', pop: 3 },
  { code: 'WAW', flag: '🇵🇱', price: 33, emoji: '🏙️', pop: 3 },
  { code: 'AMS', flag: '🇳🇱', price: 68, emoji: '🚲', pop: 4 },
  { code: 'DXB', flag: '🇦🇪', price: 89, emoji: '🏙️', pop: 4 },
]

const destinations = computed(() => destData.map(d => ({
  ...d,
  city: t(`destinations.city_${d.code}`),
  country: t(`destinations.country_${d.code}`),
  desc: t(`destinations.dest_${d.code}`),
})))

const selectedRegion = ref('all')
const regionKeys = ['all', 'europa', 'asia', 'middleEast'] as const
const regionLabels: Record<string, string> = {
  all: 'destinations.allRegions',
  europa: 'destinations.europe',
  asia: 'destinations.asia',
  middleEast: 'destinations.middleEast',
}

const europeCodes = ['OTP', 'LTN', 'BCN', 'CDG', 'VIE', 'MXP', 'BEG', 'WAW', 'AMS']
const asiaCodes = ['IST']
const middleEastCodes = ['TLV', 'DXB']

const filtered = computed(() => {
  if (selectedRegion.value === 'europa') return destinations.value.filter(d => europeCodes.includes(d.code))
  if (selectedRegion.value === 'asia') return destinations.value.filter(d => asiaCodes.includes(d.code))
  if (selectedRegion.value === 'middleEast') return destinations.value.filter(d => middleEastCodes.includes(d.code))
  return destinations.value
})

async function search(dest: (typeof destinations.value)[0]) {
  searching.value = dest.code
  searchStore.origin = { iata_code: 'MD', airport_iata: 'RMO', name: t('airports.chisinauAirportName'), city_name: t('airports.city_RMO'), country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: dest.code, name: `${dest.city} Airport`, city_name: dest.city, country_code: '' }
  const next = new Date()
  next.setDate(next.getDate() + ((5 - next.getDay() + 7) % 7 || 7))
  searchStore.departureDate = next.toISOString().split('T')[0]
  searchStore.tripType = 'oneway'
  try {
    const ok = await searchStore.submitSearch()
    if (ok) router.push('/search')
  } finally {
    searching.value = null
  }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <h1 class="text-4xl font-extrabold mb-3">{{ t('destinations.title') }}</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">{{ t('destinations.subtitle') }}</p>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-10">
      <!-- Region filter -->
      <div role="group" :aria-label="t('destinations.filterGroupLabel')" class="flex gap-2 mb-8 flex-wrap">
        <button v-for="r in regionKeys" :key="r"
          @click="selectedRegion = r"
          :aria-pressed="selectedRegion === r"
          class="px-5 py-2 rounded-full text-sm font-medium border transition-all"
          :class="selectedRegion === r
            ? 'bg-brand-600 text-white border-brand-600'
            : 'border-gray-200 text-gray-600 hover:border-brand-300 bg-white'">
          {{ t(regionLabels[r]) }}
        </button>
      </div>

      <!-- Destination grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="dest in filtered" :key="dest.code"
          class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-brand-300 hover:shadow-lg transition-all group">
          <!-- Colored header -->
          <div class="bg-gradient-to-br from-gray-100 to-gray-50 h-28 flex items-center justify-center relative">
            <span aria-hidden="true" class="text-6xl">{{ dest.emoji }}</span>
            <span aria-hidden="true" class="absolute top-3 right-3 text-2xl">{{ dest.flag }}</span>
            <span class="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {{ t('destinations.fromPrice') }} €{{ dest.price }}
            </span>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{{ dest.city }}</h3>
                <p class="text-sm text-gray-500">{{ dest.country }} · {{ dest.code }}</p>
              </div>
              <!-- Popularity stars -->
              <div role="img" :aria-label="t('destinations.popularityLabel', { n: dest.pop })" class="flex text-yellow-400 text-xs">
                <span v-for="i in dest.pop" :key="i" aria-hidden="true">★</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ dest.desc }}</p>
            <button @click="search(dest)"
              :disabled="searching !== null"
              :aria-label="t('destinations.searchBtnLabel', { city: dest.city })"
              class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <span v-if="searching === dest.code">
                <span role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              </span>
              <span v-else><span aria-hidden="true">✈</span> {{ t('destinations.searchButton') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
