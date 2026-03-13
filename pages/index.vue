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

// Popular routes from Chisinau (RMO = Chisinau in Duffel)
const popularRoutes = [
  { from: 'RMO', fromCity: 'Chișinău', to: 'OTP', toCity: 'București', flag: '🇷🇴', price: '35' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'IST', toCity: 'Istanbul', flag: '🇹🇷', price: '32' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'LTN', toCity: 'Londra', flag: '🇬🇧', price: '39' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'VIE', toCity: 'Viena', flag: '🇦🇹', price: '39' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'BCN', toCity: 'Barcelona', flag: '🇪🇸', price: '31' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'CDG', toCity: 'Paris', flag: '🇫🇷', price: '73' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'MXP', toCity: 'Milano', flag: '🇮🇹', price: '59' },
  { from: 'RMO', fromCity: 'Chișinău', to: 'TLV', toCity: 'Tel Aviv', flag: '🇮🇱', price: '45' },
]

const stats = [
  { value: '500+', label: 'Companii aeriene' },
  { value: '10K+', label: 'Destinații' },
  { value: '5 min', label: 'Timp mediu rezervare' },
]

async function quickSearch(route: typeof popularRoutes[0]) {
  searchStore.origin = { iata_code: 'MD', airport_iata: route.from, name: `${route.fromCity} International Airport`, city_name: route.fromCity, country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: route.to, name: `${route.toCity} Airport`, city_name: route.toCity, country_code: '' }
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
    <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-14 md:py-20 px-4">
      <div class="max-w-6xl mx-auto text-center mb-8">
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">{{ t('hero.title') }}</h1>
        <p class="text-xl text-brand-200 max-w-2xl mx-auto mb-8">{{ t('hero.subtitle') }}</p>
      </div>
      <SearchForm />

      <!-- Stats -->
      <div class="max-w-2xl mx-auto mt-10 grid grid-cols-3 gap-6 text-center">
        <div v-for="stat in stats" :key="stat.value">
          <div class="text-2xl md:text-3xl font-extrabold text-white">{{ stat.value }}</div>
          <div class="text-xs md:text-sm text-brand-300 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Popular routes -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('popularRoutes') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="route in popularRoutes"
          :key="route.to"
          @click="quickSearch(route)"
          class="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="text-2xl mb-2">{{ route.flag }}</div>
            <div class="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{{ route.toCity }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ route.fromCity }} →</div>
            <div class="mt-2 text-brand-600 font-bold text-sm">de la €{{ route.price }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Features -->
    <div class="bg-white border-y border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="f in features" :key="f.title" class="text-center p-6">
            <div class="text-5xl mb-4">{{ f.icon }}</div>
            <h3 class="font-bold text-gray-900 mb-2 text-lg">{{ f.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust strip -->
    <div class="max-w-6xl mx-auto px-4 py-10 text-center">
      <p class="text-sm text-gray-400 mb-4">Partener de încredere</p>
      <div class="flex items-center justify-center gap-8 opacity-40 grayscale">
        <span class="text-2xl font-bold tracking-wide">TAROM</span>
        <span class="text-2xl font-bold tracking-wide">TURKISH</span>
        <span class="text-2xl font-bold tracking-wide">RYANAIR</span>
        <span class="text-2xl font-bold tracking-wide">WIZZ</span>
        <span class="text-2xl font-bold tracking-wide">LOT</span>
      </div>
    </div>
  </div>
</template>
