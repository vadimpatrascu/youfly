<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()

const { showMdl } = useCurrency()
useSeo({ title: t('destinations.title'), description: t('destinations.seoDesc') })
useReveal()
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('destinations.title'), url: '/destinations' },
])

const searchStore = useSearchStore()
const router = useRouter()
const searching = ref<string | null>(null)

const destData = [
  { code: 'OTP', flag: '🇷🇴', price: 35, emoji: '🏛️', pop: 5, season: '🌸 Mar-Oct', flight: '1h 10m', direct: true },
  { code: 'IST', flag: '🇹🇷', price: 32, emoji: '🕌', pop: 5, season: '🌷 Apr-Jun', flight: '2h 15m', direct: true },
  { code: 'LTN', flag: '🇬🇧', price: 39, emoji: '🎡', pop: 5, season: '☀️ Jun-Sep', flight: '3h 30m', direct: true },
  { code: 'BCN', flag: '🇪🇸', price: 31, emoji: '🏖️', pop: 5, season: '☀️ May-Oct', flight: '3h 45m', direct: true },
  { code: 'CDG', flag: '🇫🇷', price: 73, emoji: '🗼', pop: 5, season: '🌸 Apr-Jun', flight: '3h 40m', direct: true },
  { code: 'VIE', flag: '🇦🇹', price: 39, emoji: '🎻', pop: 4, season: '🎄 Dec-Mar', flight: '2h 10m', direct: true },
  { code: 'MXP', flag: '🇮🇹', price: 59, emoji: '🛍️', pop: 4, season: '☀️ May-Sep', flight: '2h 55m', direct: true },
  { code: 'TLV', flag: '🇮🇱', price: 45, emoji: '🌊', pop: 4, season: '☀️ Mar-Nov', flight: '3h 00m', direct: true },
  { code: 'BEG', flag: '🇷🇸', price: 28, emoji: '🏰', pop: 3, season: '🌸 May-Sep', flight: '1h 30m', direct: true },
  { code: 'WAW', flag: '🇵🇱', price: 33, emoji: '🏙️', pop: 3, season: '☀️ Jun-Aug', flight: '2h 30m', direct: true },
  { code: 'AMS', flag: '🇳🇱', price: 68, emoji: '🚲', pop: 4, season: '🌷 Apr-Jun', flight: '3h 20m', direct: false },
  { code: 'DXB', flag: '🇦🇪', price: 89, emoji: '🏙️', pop: 4, season: '❄️ Nov-Mar', flight: '5h 30m', direct: true },
]

const destinations = computed(() => destData.map(d => ({
  ...d,
  city: t(`destinations.city_${d.code}`),
  country: t(`destinations.country_${d.code}`),
  desc: t(`destinations.dest_${d.code}`),
})))

useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: t('destinations.title'),
  numberOfItems: 12,
  itemListElement: destData.map((d, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `${t('airports.city_RMO')} → ${t('destinations.city_' + d.code)}`,
    url: 'https://youfly-xi.vercel.app/destinations',
  })),
})

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
    <DestinationPhoto code="BCN" :width="1200" height-class="relative text-white py-16 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/80"></div>
      <div class="relative z-10">
        <h1 class="text-4xl font-black mb-3">{{ t('destinations.title') }}</h1>
        <p class="text-gray-400 text-lg max-w-xl mx-auto">{{ t('destinations.subtitle') }}</p>
      </div>
    </DestinationPhoto>

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

      <!-- Results count -->
      <p class="text-sm text-gray-500 mb-4">{{ filtered.length }} {{ t('destinations.destinationsCount') }}</p>

      <!-- Destination grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="(dest, di) in filtered" :key="dest.code"
          class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-brand-300 hover:shadow-lg transition-all group reveal card-premium"
          :style="`transition-delay: ${di * 0.05}s`">
          <!-- Destination photo -->
          <DestinationPhoto :code="dest.code" height-class="h-40">
            <span aria-hidden="true" class="absolute top-3 right-3 text-2xl drop-shadow-lg z-10">{{ dest.flag }}</span>
            <span class="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10">
              {{ t('destinations.fromPrice') }} €{{ dest.price }}<span v-if="showMdl" class="opacity-80"> · {{ Math.round(dest.price * 19.5) }} MDL</span>
            </span>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </DestinationPhoto>
          <div class="p-5">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{{ dest.city }}</h3>
                <p class="text-sm text-gray-500">{{ dest.country }} · {{ dest.code }}
                  <span v-if="dest.season" class="ml-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{{ dest.season }}</span>
                </p>
              </div>
              <!-- Popularity stars -->
              <div role="img" :aria-label="t('destinations.popularityLabel', { n: dest.pop })" class="flex text-yellow-400 text-xs">
                <span v-for="i in dest.pop" :key="i" aria-hidden="true">★</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3 leading-relaxed">{{ dest.desc }}</p>
            <div class="flex items-center gap-2 mb-3 text-[10px]">
              <span v-if="dest.flight" class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded"><span aria-hidden="true">⏱</span> {{ dest.flight }}</span>
              <span v-if="dest.direct" class="bg-green-50 text-green-600 px-2 py-0.5 rounded font-semibold">{{ t('flightCard.direct') }}</span>
              <span v-else class="bg-orange-50 text-orange-600 px-2 py-0.5 rounded">1+ {{ t('flightCard.stop') }}</span>
            </div>
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
