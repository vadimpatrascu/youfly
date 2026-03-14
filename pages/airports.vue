<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
useSeo({
  title: t('airports.title'),
  description: t('airports.seoDesc'),
})
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('airports.title'), url: '/airports' },
])

const searchStore = useSearchStore()
const router = useRouter()

const regionKeys = ['all', 'Europa', 'Asia', 'MiddleEast', 'Africa', 'America'] as const
const regionLabels: Record<string, string> = {
  all: 'airports.filterAll',
  Europa: 'airports.filterEurope',
  Asia: 'airports.filterAsia',
  MiddleEast: 'airports.filterMiddleEast',
  Africa: 'airports.filterAfrica',
  America: 'airports.filterAmerica',
}
const activeRegionKey = ref('all')

const airportData = [
  { iata: 'OTP', name: 'Henri Coandă', flag: '🇷🇴', region: 'Europa', direct: true, time: '1h 10m' },
  { iata: 'IST', name: 'Istanbul Airport', flag: '🇹🇷', region: 'Asia', direct: true, time: '2h 15m' },
  { iata: 'VIE', name: 'Vienna International', flag: '🇦🇹', region: 'Europa', direct: true, time: '2h 10m' },
  { iata: 'LTN', name: 'Luton Airport', flag: '🇬🇧', region: 'Europa', direct: true, time: '3h 30m' },
  { iata: 'BCN', name: 'El Prat', flag: '🇪🇸', region: 'Europa', direct: true, time: '3h 45m' },
  { iata: 'CDG', name: 'Charles de Gaulle', flag: '🇫🇷', region: 'Europa', direct: false, time: '3h 40m' },
  { iata: 'MXP', name: 'Malpensa', flag: '🇮🇹', region: 'Europa', direct: true, time: '2h 55m' },
  { iata: 'TLV', name: 'Ben Gurion', flag: '🇮🇱', region: 'MiddleEast', direct: true, time: '3h 00m' },
  { iata: 'AMS', name: 'Schiphol', flag: '🇳🇱', region: 'Europa', direct: false, time: '3h 20m' },
  { iata: 'FRA', name: 'Frankfurt Main', flag: '🇩🇪', region: 'Europa', direct: false, time: '2h 50m' },
  { iata: 'DXB', name: 'Dubai International', flag: '🇦🇪', region: 'MiddleEast', direct: false, time: '5h 30m' },
  { iata: 'WAW', name: 'Chopin Airport', flag: '🇵🇱', region: 'Europa', direct: true, time: '2h 30m' },
  { iata: 'BUD', name: 'Liszt Ferenc', flag: '🇭🇺', region: 'Europa', direct: false, time: '1h 50m' },
  { iata: 'ATH', name: 'Eleftherios Venizelos', flag: '🇬🇷', region: 'Europa', direct: false, time: '2h 40m' },
  { iata: 'MUC', name: 'Munich Airport', flag: '🇩🇪', region: 'Europa', direct: false, time: '2h 45m' },
  { iata: 'LHR', name: 'Heathrow', flag: '🇬🇧', region: 'Europa', direct: false, time: '3h 30m' },
  { iata: 'MAD', name: 'Barajas', flag: '🇪🇸', region: 'Europa', direct: false, time: '3h 55m' },
  { iata: 'CMN', name: 'Mohammed V', flag: '🇲🇦', region: 'Africa', direct: false, time: '5h 00m' },
]

const airports = computed(() => airportData.map(a => ({
  ...a,
  city: t(`airports.city_${a.iata}`),
  country: t(`airports.country_${a.iata}`),
})))

const filtered = computed(() =>
  activeRegionKey.value === 'all'
    ? airports.value
    : airports.value.filter(a => a.region === activeRegionKey.value)
)

const directCount = computed(() => airports.value.filter(a => a.direct).length)

async function searchFrom(airport: (typeof airports.value)[0]) {
  searchStore.destination = {
    iata_code: airport.country,
    airport_iata: airport.iata,
    name: `${airport.name}`,
    city_name: airport.city,
    country_code: airport.country,
  }
  searchStore.origin = {
    iata_code: 'MD',
    airport_iata: 'RMO',
    name: t('airports.chisinauAirportName'),
    city_name: t('airports.city_RMO'),
    country_code: 'MD',
  }

  const nextFriday = new Date()
  nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7 || 7))
  searchStore.departureDate = nextFriday.toISOString().split('T')[0]
  searchStore.tripType = 'oneway'
  const ok = await searchStore.submitSearch()
  if (ok) router.push('/search')
}
</script>

<template>
  <div>
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <div aria-hidden="true" class="text-5xl mb-4">🛫</div>
      <h1 class="text-4xl font-extrabold mb-3">{{ t('airports.title') }}</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">
        {{ airports.length }} {{ t('airports.fromChisinau') }} — {{ directCount }} {{ t('airports.directFlightsCount') }}
      </p>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-10">
      <!-- Region filter -->
      <div role="group" :aria-label="t('airports.filterGroupLabel')" class="flex gap-2 flex-wrap mb-8">
        <button v-for="r in regionKeys" :key="r" @click="activeRegionKey = r"
          :aria-pressed="activeRegionKey === r"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="activeRegionKey === r
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'">
          {{ t(regionLabels[r]) }}
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-2xl font-black text-brand-600">{{ filtered.filter(a => a.direct).length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('airports.directFlightsCount') }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-2xl font-black text-brand-600">{{ filtered.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('airports.allDestinations') }}</div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div class="text-2xl font-black text-brand-600">{{ [...new Set(filtered.map(a => a.country))].length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('airports.countries') }}</div>
        </div>
      </div>

      <!-- Airport grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="airport in filtered" :key="airport.iata"
          class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-sm transition-all p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <span aria-hidden="true" class="text-3xl">{{ airport.flag }}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">{{ airport.iata }}</span>
                  <span v-if="airport.direct" class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium"><span aria-hidden="true">✈</span> {{ t('airports.directBadge') }}</span>
                  <span v-else class="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded">{{ t('airports.withStopsBadge') }}</span>
                </div>
                <h3 class="font-semibold text-gray-900 mt-1">{{ airport.city }}, {{ airport.country }}</h3>
                <p class="text-xs text-gray-400">{{ airport.name }}</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-sm font-semibold text-gray-700"><span aria-hidden="true">⏱</span> {{ airport.time }}</div>
              <button @click="searchFrom(airport)"
                :aria-label="t('airports.searchBtnLabel', { city: airport.city, iata: airport.iata })"
                class="mt-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors">
                {{ t('airports.searchBtn') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
