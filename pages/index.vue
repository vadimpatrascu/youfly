<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()

useHead({ title: 'YouFly — Rezervă zboruri rapid' })

const features = computed(() => [
  { icon: '✈️', title: t('features.airlines'), desc: t('features.airlinesDesc') },
  { icon: '💰', title: t('features.prices'), desc: t('features.pricesDesc') },
  { icon: '⚡', title: t('features.fast'), desc: t('features.fastDesc') },
])

// Popular routes from Chisinau (like sky.md)
const popularRoutes = [
  { from: 'KIV', fromCity: 'Chișinău', to: 'OTP', toCity: 'București', flag: '🇷🇴', price: '35' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'IST', toCity: 'Istanbul', flag: '🇹🇷', price: '32' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'LTN', toCity: 'Londra', flag: '🇬🇧', price: '39' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'VIE', toCity: 'Viena', flag: '🇦🇹', price: '39' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'BCN', toCity: 'Barcelona', flag: '🇪🇸', price: '31' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'CDG', toCity: 'Paris', flag: '🇫🇷', price: '73' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'MXP', toCity: 'Milano', flag: '🇮🇹', price: '59' },
  { from: 'KIV', fromCity: 'Chișinău', to: 'TLV', toCity: 'Tel Aviv', flag: '🇮🇱', price: '45' },
]

// Quick search from popular route
async function quickSearch(route: typeof popularRoutes[0]) {
  // Set search params
  searchStore.origin = { iata_code: 'MD', airport_iata: route.from, name: `${route.fromCity} Airport`, city_name: route.fromCity, country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: route.to, name: `${route.toCity} Airport`, city_name: route.toCity, country_code: '' }

  // Set departure date to next Friday
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
    <!-- Hero -->
    <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-16 md:py-24 px-4">
      <div class="max-w-6xl mx-auto text-center mb-10">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">{{ t('hero.title') }}</h1>
        <p class="text-xl text-brand-200 max-w-2xl mx-auto">{{ t('hero.subtitle') }}</p>
      </div>
      <SearchForm />
    </div>

    <!-- Popular routes -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('popularRoutes') || 'Rute populare' }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="route in popularRoutes"
          :key="route.to"
          @click="quickSearch(route)"
          class="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-brand-400 hover:shadow-md transition-all group"
        >
          <div class="text-2xl mb-2">{{ route.flag }}</div>
          <div class="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{{ route.toCity }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ route.fromCity }} →</div>
          <div class="mt-2 text-brand-600 font-bold text-sm">de la €{{ route.price }}</div>
        </button>
      </div>
    </div>

    <!-- Features -->
    <div class="max-w-6xl mx-auto px-4 pb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="f in features" :key="f.title" class="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
          <div class="text-4xl mb-3">{{ f.icon }}</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ f.title }}</h3>
          <p class="text-gray-500 text-sm">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
