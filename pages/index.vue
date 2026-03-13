<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()
const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()

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

const { searches: recentSearches } = useRecentSearches()

// Newsletter
const newsletterEmail = ref('')
const newsletterLoading = ref(false)
const newsletterMsg = ref('')

async function subscribeNewsletter() {
  if (!newsletterEmail.value.trim()) return
  newsletterLoading.value = true
  newsletterMsg.value = ''
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: newsletterEmail.value } })
    newsletterMsg.value = '✓ Abonare cu succes! Vei primi alertele de prețuri.'
    newsletterEmail.value = ''
  } catch {
    newsletterMsg.value = 'Eroare. Te rugăm să încerci din nou.'
  } finally {
    newsletterLoading.value = false
  }
}

async function quickSearchRecent(rs: import('~/composables/useRecentSearches').RecentSearch) {
  searchStore.origin = { iata_code: '', airport_iata: rs.originCode, name: rs.originCity, city_name: rs.originCity, country_code: '' }
  searchStore.destination = { iata_code: '', airport_iata: rs.destinationCode, name: rs.destinationCity, city_name: rs.destinationCity, country_code: '' }
  searchStore.departureDate = rs.departureDate
  searchStore.adults = rs.adults
  searchStore.tripType = rs.tripType
  searchingRoute.value = rs.destinationCode
  try {
    const ok = await searchStore.submitSearch()
    if (ok) router.push('/search')
    else searchRouteError.value = 'Căutare eșuată. Încearcă din nou.'
  } finally {
    searchingRoute.value = null
  }
}

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

      <!-- Recent searches -->
      <div v-if="recentSearches.length" class="max-w-4xl mx-auto mt-4 px-4">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-xs text-brand-300 shrink-0">Căutări recente:</span>
          <button v-for="rs in recentSearches.slice(0, 3)" :key="rs.searchedAt"
            @click="quickSearchRecent(rs)"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full px-3 py-1.5 text-xs text-white transition-colors border border-white/20">
            <span>✈</span>
            <span>{{ rs.originCity }} → {{ rs.destinationCity }}</span>
            <span class="text-brand-300">{{ rs.departureDate }}</span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="max-w-2xl mx-auto mt-10 grid grid-cols-3 gap-6 text-center">
        <div v-for="stat in stats" :key="stat.value">
          <div class="text-2xl md:text-3xl font-extrabold text-white">{{ stat.value }}</div>
          <div class="text-xs md:text-sm text-brand-300 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Saved favorites -->
    <div v-if="favorites.length" class="max-w-6xl mx-auto px-4 pt-8">
      <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span class="text-red-500">♥</span> Rute favorite
      </h2>
      <div class="flex gap-2 flex-wrap">
        <button v-for="fav in favorites" :key="fav.from + fav.to"
          @click="quickSearch({ from: fav.from, fromCity: fav.fromCity, to: fav.to, toCity: fav.toCity, flag: '', price: '' })"
          class="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-400 rounded-full px-4 py-2 text-sm transition-colors group">
          <span class="font-semibold text-gray-700">{{ fav.fromCity }}</span>
          <span class="text-gray-400">→</span>
          <span class="font-semibold text-brand-600">{{ fav.toCity }}</span>
          <button @click.stop="toggleFavorite(fav)" class="text-red-400 hover:text-red-600 ml-1 text-xs">✕</button>
        </button>
      </div>
    </div>

    <!-- Price trends -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PriceTrends />
        <!-- Quick tip -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6">
          <div class="text-3xl mb-3">💡</div>
          <h3 class="font-bold text-gray-900 mb-3">Sfaturi pentru prețuri mai mici</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2"><span class="text-green-500 shrink-0 mt-0.5">✓</span> Rezervați cu 3-6 săptămâni înainte pentru cel mai bun preț</li>
            <li class="flex items-start gap-2"><span class="text-green-500 shrink-0 mt-0.5">✓</span> Marți și miercuri sunt zilele cu cele mai mici prețuri</li>
            <li class="flex items-start gap-2"><span class="text-green-500 shrink-0 mt-0.5">✓</span> Evitați zborul în ajunul sărbătorilor legale</li>
            <li class="flex items-start gap-2"><span class="text-green-500 shrink-0 mt-0.5">✓</span> Comparați aeroporturi alternative (ex. Iași în loc de București)</li>
            <li class="flex items-start gap-2"><span class="text-green-500 shrink-0 mt-0.5">✓</span> Zborurile cu escală sunt uneori cu 40% mai ieftine</li>
          </ul>
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
            <div class="flex items-start justify-between mb-1">
              <div class="text-2xl">{{ route.flag }}</div>
              <button @click.stop="toggleFavorite({ from: route.from, fromCity: route.fromCity, to: route.to, toCity: route.toCity })"
                class="text-lg transition-colors"
                :class="isFavorite(route.from, route.to) ? 'text-red-500' : 'text-gray-200 group-hover:text-gray-300'"
                :title="isFavorite(route.from, route.to) ? 'Scoate din favorite' : 'Adaugă la favorite'">
                ♥
              </button>
            </div>
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

    <!-- Newsletter -->
    <div class="bg-gray-900 text-white py-14 px-4">
      <div class="max-w-lg mx-auto text-center">
        <div class="text-4xl mb-4">✉️</div>
        <h2 class="text-2xl font-bold mb-3">Prețuri speciale în inbox-ul tău</h2>
        <p class="text-gray-400 text-sm mb-6">Abonează-te și primești alertele de prețuri pentru rutele tale favorite. Niciun spam.</p>
        <form @submit.prevent="subscribeNewsletter" class="flex gap-3 max-w-sm mx-auto">
          <input v-model="newsletterEmail" type="email" placeholder="email@exemplu.com"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button type="submit" :disabled="newsletterLoading"
            class="px-5 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shrink-0">
            {{ newsletterLoading ? '...' : 'Abonare' }}
          </button>
        </form>
        <p v-if="newsletterMsg" class="mt-3 text-sm" :class="newsletterMsg.includes('succes') ? 'text-green-400' : 'text-red-400'">{{ newsletterMsg }}</p>
        <p class="text-xs text-gray-600 mt-3">Poți dezabona oricând. Datele tale sunt în siguranță.</p>
      </div>
    </div>
</div>
</template>
