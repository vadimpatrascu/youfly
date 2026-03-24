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

useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: t('airports.title'),
  numberOfItems: 30,
})

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

// Verified destinations from Chișinău (RMO) — based on airport.md + airportinformation.com data (2026)
// 25 airlines, 77+ non-stop destinations across 32 countries
const airportData = [
  // Direct flights — verified active routes
  { iata: 'OTP', name: 'Henri Coandă', flag: '🇷🇴', region: 'Europa', direct: true, time: '1h 10m', airlines: ['TAROM', 'Wizz Air'] },
  { iata: 'IST', name: 'Istanbul Airport', flag: '🇹🇷', region: 'Asia', direct: true, time: '2h 15m', airlines: ['Turkish Airlines', 'AJet'] },
  { iata: 'VIE', name: 'Vienna International', flag: '🇦🇹', region: 'Europa', direct: true, time: '2h 10m', airlines: ['Austrian Airlines'] },
  { iata: 'LTN', name: 'Luton Airport', flag: '🇬🇧', region: 'Europa', direct: true, time: '3h 30m', airlines: ['Wizz Air'] },
  { iata: 'BCN', name: 'El Prat', flag: '🇪🇸', region: 'Europa', direct: true, time: '3h 45m', airlines: ['Wizz Air'] },
  { iata: 'CDG', name: 'Charles de Gaulle', flag: '🇫🇷', region: 'Europa', direct: true, time: '3h 40m', airlines: ['HiSky'] },
  { iata: 'MXP', name: 'Malpensa', flag: '🇮🇹', region: 'Europa', direct: true, time: '2h 55m', airlines: ['Wizz Air', 'FlyOne'] },
  { iata: 'TLV', name: 'Ben Gurion', flag: '🇮🇱', region: 'MiddleEast', direct: true, time: '3h 00m', airlines: ['FlyOne', 'El Al'] },
  { iata: 'FRA', name: 'Frankfurt Main', flag: '🇩🇪', region: 'Europa', direct: true, time: '2h 50m', airlines: ['Lufthansa'] },
  { iata: 'DXB', name: 'Dubai International', flag: '🇦🇪', region: 'MiddleEast', direct: true, time: '5h 30m', airlines: ['flydubai'] },
  { iata: 'WAW', name: 'Chopin Airport', flag: '🇵🇱', region: 'Europa', direct: true, time: '2h 30m', airlines: ['LOT'] },
  { iata: 'BUD', name: 'Liszt Ferenc', flag: '🇭🇺', region: 'Europa', direct: true, time: '1h 50m' },
  { iata: 'ATH', name: 'Eleftherios Venizelos', flag: '🇬🇷', region: 'Europa', direct: true, time: '2h 40m' },
  { iata: 'FCO', name: 'Fiumicino', flag: '🇮🇹', region: 'Europa', direct: true, time: '2h 45m' },
  { iata: 'BER', name: 'Berlin Brandenburg', flag: '🇩🇪', region: 'Europa', direct: true, time: '2h 40m' },
  { iata: 'STN', name: 'Stansted Airport', flag: '🇬🇧', region: 'Europa', direct: true, time: '3h 25m' },
  { iata: 'DUS', name: 'Düsseldorf', flag: '🇩🇪', region: 'Europa', direct: true, time: '2h 50m' },
  { iata: 'CPH', name: 'Copenhagen Kastrup', flag: '🇩🇰', region: 'Europa', direct: true, time: '2h 55m' },
  { iata: 'DUB', name: 'Dublin Airport', flag: '🇮🇪', region: 'Europa', direct: true, time: '4h 00m' },
  { iata: 'LIS', name: 'Lisbon Humberto Delgado', flag: '🇵🇹', region: 'Europa', direct: true, time: '4h 30m' },
  { iata: 'NAP', name: 'Naples International', flag: '🇮🇹', region: 'Europa', direct: true, time: '2h 30m' },
  { iata: 'PRG', name: 'Václav Havel', flag: '🇨🇿', region: 'Europa', direct: true, time: '2h 15m' },
  { iata: 'SOF', name: 'Sofia Airport', flag: '🇧🇬', region: 'Europa', direct: true, time: '1h 30m' },
  { iata: 'TBS', name: 'Tbilisi International', flag: '🇬🇪', region: 'Asia', direct: true, time: '2h 45m' },
  { iata: 'EVN', name: 'Zvartnots', flag: '🇦🇲', region: 'Asia', direct: true, time: '3h 00m' },
  // Connections via hubs
  { iata: 'AMS', name: 'Schiphol', flag: '🇳🇱', region: 'Europa', direct: false, time: '3h 20m' },
  { iata: 'MAD', name: 'Barajas', flag: '🇪🇸', region: 'Europa', direct: true, time: '3h 55m' },
  { iata: 'LHR', name: 'Heathrow', flag: '🇬🇧', region: 'Europa', direct: false, time: '3h 30m' },
  { iata: 'MUC', name: 'Munich Airport', flag: '🇩🇪', region: 'Europa', direct: false, time: '2h 45m' },
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
    iata_code: airport.iata,
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
    <DestinationPhoto code="IST" :width="1200" height-class="relative text-white py-16 px-4 text-center">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/80"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>
        <h1 class="text-4xl font-black mb-3">{{ t('airports.title') }}</h1>
        <p class="text-gray-400 text-lg max-w-xl mx-auto mb-4">
          {{ airports.length }} {{ t('airports.fromChisinau') }} — {{ directCount }} {{ t('airports.directFlightsCount') }}
        </p>
        <div class="flex items-center justify-center gap-3 text-xs text-gray-500">
          <span class="bg-white/10 px-3 py-1 rounded-full">25 {{ t('about.stat1Label') }}</span>
          <span class="bg-white/10 px-3 py-1 rounded-full">32 {{ t('airports.countries') }}</span>
        </div>
      </div>
    </DestinationPhoto>

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
                <div v-if="airport.airlines?.length" class="flex gap-1 mt-1.5 flex-wrap">
                  <span v-for="al in airport.airlines" :key="al" class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{{ al }}</span>
                </div>
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

      <!-- Top cities directory (SEO-rich, inspired by zbor.md) -->
      <div class="mt-10 bg-white rounded-2xl border border-gray-200 p-6">
        <h3 class="font-bold text-gray-900 mb-4">{{ t('airports.topDestLabel') }}</h3>
        <div class="flex flex-wrap gap-2">
          <NuxtLink v-for="city in [
            'București','Istanbul','Londra','Barcelona','Paris','Viena','Milano','Tel Aviv','Dubai','Frankfurt',
            'Berlin','Varșovia','Budapesta','Atena','Praga','Copenhaga','Dublin','Lisabona','Napoli','Sofia',
            'Düsseldorf','Amsterdam','Madrid','München','Roma','Tbilisi','Erevan','Casablanca',
          ]" :key="city" to="/destinations"
            class="text-xs text-gray-500 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-colors">
            {{ city }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
