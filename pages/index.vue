<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()

useHead({ title: computed(() => 'YouFly — ' + t('hero.title')) })

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

const searchingRoute = ref<string | null>(null)
const searchRouteError = ref('')

async function quickSearch(route: typeof popularRoutes[0]) {
  searchingRoute.value = route.to
  searchRouteError.value = ''
  searchStore.origin = { iata_code: 'MD', airport_iata: route.from, name: `${route.fromCity} International Airport`, city_name: route.fromCity, country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: route.to, name: `${route.toCity} Airport`, city_name: route.toCity, country_code: '' }
  const nextFriday = new Date()
  nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7 || 7))
  searchStore.departureDate = nextFriday.toISOString().split('T')[0]
  searchStore.tripType = 'oneway'
  try {
    const ok = await searchStore.submitSearch()
    if (ok) router.push('/search')
    else searchRouteError.value = 'Căutare eșuată. Încearcă din nou.'
  } finally {
    searchingRoute.value = null
  }
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
          :disabled="searchingRoute !== null"
          class="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden disabled:opacity-60 disabled:cursor-wait"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div v-if="searchingRoute === route.to" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
              <div class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="text-2xl mb-2">{{ route.flag }}</div>
            <div class="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{{ route.toCity }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ route.fromCity }} →</div>
            <div class="mt-2 text-brand-600 font-bold text-sm">de la €{{ route.price }}</div>
          </div>
        </button>
        <p v-if="searchRouteError" class="col-span-full text-red-600 text-sm text-center">{{ searchRouteError }}</p>
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
  
    <!-- Testimonials -->
    <div class="bg-brand-600 text-white py-14 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-center mb-8 text-white">Ce spun clienții noștri</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="review in [
            { name: 'Maria C.', city: 'Chișinău', text: 'Am găsit un zbor spre Londra cu 40€ mai ieftin decât pe alte platforme! Procesul a fost extrem de simplu.', stars: 5 },
            { name: 'Alexandru P.', city: 'Bălți', text: 'Rezervarea a durat mai puțin de 5 minute. Interfața e clară și ușor de folosit. Recomand cu încredere!', stars: 5 },
            { name: 'Elena M.', city: 'Chișinău', text: 'Am rezervat bilete pentru întreaga familie la prețuri foarte bune. Filtrele de căutare sunt foarte utile.', stars: 5 },
          ]" :key="review.name"
            class="bg-white/10 backdrop-blur rounded-2xl p-5">
            <div class="flex mb-3">
              <span v-for="s in review.stars" :key="s" class="text-yellow-300 text-lg">★</span>
            </div>
            <p class="text-brand-100 text-sm leading-relaxed mb-4">"{{ review.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {{ review.name[0] }}
              </div>
              <div>
                <div class="text-sm font-semibold text-white">{{ review.name }}</div>
                <div class="text-xs text-brand-300">{{ review.city }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="max-w-6xl mx-auto px-4 py-12 border-t border-gray-100">
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Cum funcționează</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
          <h3 class="font-semibold text-gray-900 mb-2">Caută zboruri</h3>
          <p class="text-gray-500 text-sm">Introdu aeroportul de plecare, destinația și datele de călătorie.</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
          <h3 class="font-semibold text-gray-900 mb-2">Compară prețurile</h3>
          <p class="text-gray-500 text-sm">Filtrează după preț, escale, companie aeriană și durata zborului.</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
          <h3 class="font-semibold text-gray-900 mb-2">Rezervă în câteva minute</h3>
          <p class="text-gray-500 text-sm">Completează datele pasagerilor și finalizează rezervarea rapid și sigur.</p>
        </div>
      </div>
    </div>
</div>
</template>
