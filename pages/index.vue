<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()
const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()

useWebsiteStructuredData()
useOrganizationStructuredData()

useSeo({ title: t('hero.title'), description: t('hero.subtitle') })
useReveal()

const features = computed(() => [
  { icon: 'plane', svg: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', title: t('features.airlines'), desc: t('features.airlinesDesc') },
  { icon: 'price', svg: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: t('features.prices'), desc: t('features.pricesDesc') },
  { icon: 'fast', svg: 'M13 10V3L4 14h7v7l9-11h-7z', title: t('features.fast'), desc: t('features.fastDesc') },
])

// Popular routes from Chisinau (RMO = Chisinau in Duffel)
const routeData = [
  { from: 'RMO', to: 'OTP', flag: '🇷🇴', price: '35', duration: '1h 10m' },
  { from: 'RMO', to: 'IST', flag: '🇹🇷', price: '32', duration: '2h 15m' },
  { from: 'RMO', to: 'LTN', flag: '🇬🇧', price: '39', duration: '3h 30m' },
  { from: 'RMO', to: 'VIE', flag: '🇦🇹', price: '39', duration: '2h 10m' },
  { from: 'RMO', to: 'BCN', flag: '🇪🇸', price: '31', duration: '3h 45m' },
  { from: 'RMO', to: 'CDG', flag: '🇫🇷', price: '73', duration: '3h 40m' },
  { from: 'RMO', to: 'MXP', flag: '🇮🇹', price: '59', duration: '2h 55m' },
  { from: 'RMO', to: 'TLV', flag: '🇮🇱', price: '45', duration: '3h 00m' },
]
const popularRoutes = computed(() => routeData.map(r => ({
  ...r,
  fromCity: t('index.cityRMO'),
  toCity: t(`index.city_${r.to}`),
})))

const stats = computed(() => [
  { value: '500+', label: t('index.statAirlines') },
  { value: '10K+', label: t('index.statDestinations') },
  { value: '5 min', label: t('index.statTime') },
])

const searchingRoute = ref<string | null>(null)
const searchRouteError = ref('')

const { searches: recentSearches } = useRecentSearches()

// Newsletter
const newsletterEmail = ref('')
const newsletterLoading = ref(false)
const newsletterMsg = ref('')
const newsletterSuccess = ref(false)

async function subscribeNewsletter() {
  if (!newsletterEmail.value.trim()) return
  newsletterLoading.value = true
  newsletterMsg.value = ''
  try {
    await $fetch('/api/newsletter', { method: 'POST', body: { email: newsletterEmail.value } })
    newsletterMsg.value = t('index.newsletterSuccess')
    newsletterSuccess.value = true
    newsletterEmail.value = ''
  } catch {
    newsletterMsg.value = t('index.newsletterError')
    newsletterSuccess.value = false
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
    else searchRouteError.value = t('index.searchError')
  } finally {
    searchingRoute.value = null
  }
}

async function quickSearch(route: (typeof popularRoutes.value)[0]) {
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
    else searchRouteError.value = t('index.searchError')
  } finally {
    searchingRoute.value = null
  }
}

// Animated count-up for social proof
const { current: countDest, el: countDestEl } = useCountUp(77)
const { current: countAirlines, el: countAirlinesEl } = useCountUp(25)
const { current: countCountries, el: countCountriesEl } = useCountUp(32)
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════════════ -->
    <!-- HERO — Immersive cinematic with search form     -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="relative overflow-hidden bg-surface-950 text-white wave-divider">
      <!-- Background layers -->
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1400&q=80"
          alt="" class="absolute inset-0 w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-b from-surface-950/80 via-brand-900/50 to-surface-950/95"></div>
        <!-- Orbs -->
        <div class="orb w-[500px] h-[500px] bg-brand-500 -top-40 -right-40"></div>
        <div class="orb w-[400px] h-[400px] bg-accent-500 bottom-0 -left-32" style="animation-delay: -4s"></div>
        <!-- Particles -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <!-- Flight path arcs -->
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path d="M-50,400 Q300,100 600,200 Q900,300 1250,100" fill="none" stroke="rgba(14,165,233,0.12)" stroke-width="1" class="flight-path" />
          <path d="M-50,450 Q400,150 700,250 Q1000,350 1250,50" fill="none" stroke="rgba(14,165,233,0.06)" stroke-width="1" class="flight-path" style="animation-delay: -7s" />
        </svg>
      </div>

      <div class="relative z-10 pt-16 md:pt-24 pb-20 md:pb-28 px-4">
        <div class="max-w-5xl mx-auto text-center mb-10">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs font-medium text-brand-200 mb-6 animate-fade-in">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>Chișinău (KIV) — 25+ companii aeriene</span>
          </div>
          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.05] tracking-tight">
            <span class="block text-shimmer">{{ t('hero.title') }}</span>
          </h1>
          <p class="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">{{ t('hero.subtitle') }}</p>
        </div>

        <!-- Search Form -->
        <SearchForm />

        <!-- Recent searches -->
        <div v-if="recentSearches.length" class="max-w-4xl mx-auto mt-6 px-4">
          <div class="flex items-center gap-3 flex-wrap justify-center">
            <span class="text-xs text-gray-500 shrink-0">{{ t('index.recentSearches') }}</span>
            <button v-for="rs in recentSearches.slice(0, 3)" :key="rs.searchedAt"
              @click="quickSearchRecent(rs)"
              :aria-label="t('index.recentSearchLabel', { from: rs.originCity, to: rs.destinationCity, date: rs.departureDate })"
              class="flex items-center gap-2 glass hover:bg-white/10 rounded-full px-4 py-2 text-xs text-gray-300 transition-all hover:border-white/20">
              <svg class="w-3.5 h-3.5 text-brand-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              <span>{{ rs.originCity }} <span class="text-gray-600 mx-0.5">→</span> {{ rs.destinationCity }}</span>
            </button>
          </div>
        </div>

        <!-- Trust badges row -->
        <div class="max-w-3xl mx-auto mt-10 grid grid-cols-3 gap-3 md:gap-4">
          <div v-for="stat in stats" :key="stat.value" class="glass rounded-2xl py-4 px-4 text-center hover:bg-white/10 transition-all cursor-default group">
            <div class="text-xl md:text-3xl font-black text-white group-hover:text-brand-300 transition-colors">{{ stat.value }}</div>
            <div class="text-[10px] md:text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SAVED FAVORITES                                 -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="favorites.length" class="max-w-6xl mx-auto px-4 pt-10">
      <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        {{ t('index.savedFavorites') }}
      </h2>
      <div class="flex gap-2 flex-wrap">
        <div v-for="fav in favorites" :key="fav.from + fav.to"
          class="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-400 rounded-full px-4 py-2 text-sm transition-all shadow-sm hover:shadow-md">
          <button @click="quickSearch({ from: fav.from, fromCity: fav.fromCity, to: fav.to, toCity: fav.toCity, flag: '', price: '', duration: '' })"
            :aria-label="t('index.searchRouteLabel', { from: fav.fromCity, to: fav.toCity })"
            class="flex items-center gap-2">
            <span class="font-semibold text-gray-700">{{ fav.fromCity }}</span>
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            <span class="font-semibold text-brand-600">{{ fav.toCity }}</span>
          </button>
          <button @click.stop="toggleFavorite(fav)" :aria-label="t('index.favoriteRemoveRoute', { from: fav.fromCity, to: fav.toCity })" class="text-red-300 hover:text-red-500 ml-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- PRICE TRENDS + TIPS                             -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PriceTrends />
        <div class="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-green-100/80 p-6 shadow-card">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <h3 class="font-bold text-gray-900">{{ t('index.priceTips') }}</h3>
          </div>
          <ul class="space-y-3 text-sm text-gray-700">
            <li class="flex items-start gap-2.5"><svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> {{ t('index.tip1') }}</li>
            <li class="flex items-start gap-2.5"><svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> {{ t('index.tip2') }}</li>
            <li class="flex items-start gap-2.5"><svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> {{ t('index.tip3') }}</li>
            <li class="flex items-start gap-2.5"><svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> {{ t('index.tip4') }}</li>
            <li class="flex items-start gap-2.5"><svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> {{ t('index.tip5') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- POPULAR DESTINATIONS — Premium cards             -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-14 reveal">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 bg-brand-50 text-brand-600 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {{ t('popularRoutes') }}
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">{{ t('popularRoutes') }}</h2>
        <p class="text-gray-500 text-sm max-w-lg mx-auto">{{ t('destinations.subtitle') }}</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div
          v-for="(route, ri) in popularRoutes"
          :key="route.to"
          class="group relative rounded-2xl overflow-hidden cursor-pointer reveal card-premium h-56 md:h-64"
          :style="`transition-delay: ${ri * 0.06}s`"
        >
          <DestinationPhoto :code="route.to" height-class="absolute inset-0" :no-animation="true" />
          <!-- Loading overlay -->
          <div v-if="searchingRoute === route.to" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <div role="status" :aria-label="t('common.loading')" class="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-500"></div>
          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <button
              @click.stop="toggleFavorite({ from: route.from, fromCity: route.fromCity, to: route.to, toCity: route.toCity })"
              class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all z-10"
              :class="isFavorite(route.from, route.to) ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40 hover:text-white/80 hover:bg-white/20'"
              :aria-label="isFavorite(route.from, route.to) ? t('index.favoriteRemoveRoute', { from: route.fromCity, to: route.toCity }) : t('index.favoriteAdd')"
              :aria-pressed="isFavorite(route.from, route.to)">
              <svg class="w-4 h-4" :fill="isFavorite(route.from, route.to) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>

            <button @click="quickSearch(route)" :disabled="searchingRoute !== null"
              :aria-label="t('index.searchRouteLabel', { from: route.fromCity, to: route.toCity })"
              class="w-full text-left relative disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg">
              <div class="flex items-center gap-1.5 mb-1.5">
                <span class="text-lg">{{ route.flag }}</span>
                <span class="font-black text-white text-lg group-hover:text-brand-300 transition-colors leading-tight">{{ route.toCity }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ route.fromCity }}</span>
                <span class="text-brand-400 font-black text-sm">{{ t('index.fromPrice') }}{{ route.price }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1.5">
                <span v-if="route.duration" class="text-[10px] text-gray-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ route.duration }}
                </span>
                <span class="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">Direct</span>
              </div>
            </button>
          </div>
        </div>
        <p v-if="searchRouteError" role="alert" class="col-span-full text-red-600 text-sm text-center">{{ searchRouteError }}</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- WHY CHOOSE YOUFLY — Feature cards                -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="bg-surface-50 reveal">
      <div class="max-w-6xl mx-auto px-4 py-16">
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">{{ t('index.whyTitle') }}</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(f, fi) in features" :key="f.title"
            class="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-card card-premium overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
              :class="fi === 0 ? 'from-brand-400 to-brand-600' : fi === 1 ? 'from-emerald-400 to-emerald-600' : 'from-amber-400 to-amber-600'"></div>
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
              :class="fi === 0 ? 'bg-brand-50 text-brand-600' : fi === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" :stroke="fi === 0 ? '#0284c7' : fi === 1 ? '#059669' : '#d97706'" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="f.svg" /></svg>
            </div>
            <h3 class="font-black text-gray-900 mb-2 text-lg">{{ f.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SOCIAL PROOF — Animated stats strip              -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="bg-surface-950 py-10 px-4 reveal relative overflow-hidden">
      <div class="orb w-[300px] h-[300px] bg-brand-600 -top-20 left-1/4" style="animation-delay: -2s" aria-hidden="true"></div>
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white relative z-10">
        <div ref="countDestEl" class="group">
          <div class="text-3xl md:text-5xl font-black text-gradient-brand group-hover:scale-105 transition-transform">{{ countDest }}+</div>
          <div class="text-xs text-gray-500 mt-2 uppercase tracking-wider font-medium">{{ t('index.statDestinations') }}</div>
        </div>
        <div ref="countAirlinesEl" class="group">
          <div class="text-3xl md:text-5xl font-black text-gradient-brand group-hover:scale-105 transition-transform">{{ countAirlines }}</div>
          <div class="text-xs text-gray-500 mt-2 uppercase tracking-wider font-medium">{{ t('index.statAirlines') }}</div>
        </div>
        <div class="group">
          <div class="text-3xl md:text-5xl font-black text-gradient-warm group-hover:scale-105 transition-transform">4.9<span class="text-xl">★</span></div>
          <div class="text-xs text-gray-500 mt-2 uppercase tracking-wider font-medium">177 reviews</div>
        </div>
        <div ref="countCountriesEl" class="group">
          <div class="text-3xl md:text-5xl font-black text-gradient-brand group-hover:scale-105 transition-transform">{{ countCountries }}</div>
          <div class="text-xs text-gray-500 mt-2 uppercase tracking-wider font-medium">{{ t('airports.countries') }}</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- AIRLINE PARTNERS — Logo strip                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-12 text-center">
      <p class="text-xs text-gray-400 mb-8 uppercase tracking-[0.2em] font-medium">{{ t('index.trustedPartner') }} — 25+ {{ t('about.stat1Label').toLowerCase() }}</p>
      <div :aria-label="t('index.airlinesLabel')" class="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
        <div v-for="al in [
          { iata: 'W6', name: 'Wizz Air' },
          { iata: 'TK', name: 'Turkish Airlines' },
          { iata: 'RO', name: 'TAROM' },
          { iata: 'OS', name: 'Austrian Airlines' },
          { iata: 'LO', name: 'LOT Polish Airlines' },
          { iata: 'LH', name: 'Lufthansa' },
          { iata: '5F', name: 'FlyOne' },
          { iata: 'H4', name: 'HiSky' },
          { iata: 'FZ', name: 'flydubai' },
        ]" :key="al.iata" class="group">
          <img :src="`https://assets.duffel.com/img/airlines/for-light-background/${al.iata}.svg`"
            :alt="al.name"
            class="h-7 md:h-9 w-auto opacity-25 group-hover:opacity-70 transition-all duration-300 grayscale group-hover:grayscale-0 group-hover:scale-110"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'" />
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- TESTIMONIALS — Dark immersive                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="text-white py-20 px-4 reveal relative overflow-hidden">
      <DestinationPhoto code="AMS" :width="1200" height-class="absolute inset-0" :no-animation="true" />
      <div class="absolute inset-0 bg-surface-950/90"></div>
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-black mb-3">{{ t('index.testimonialsTitle') }}</h2>
          <div class="flex items-center justify-center gap-2">
            <span class="text-yellow-300 text-lg tracking-wide">★★★★★</span>
            <span class="text-white font-black text-xl">4.97</span>
            <span class="text-gray-400 text-sm">/ 5 · 177 reviews</span>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="review in [
            { name: 'Maria C.', city: t('index.cityRMO'), text: t('index.review1'), stars: 5 },
            { name: 'Alexandru P.', city: t('index.cityBalti'), text: t('index.review2'), stars: 5 },
            { name: 'Elena M.', city: t('index.cityRMO'), text: t('index.review3'), stars: 5 },
          ]" :key="review.name"
            class="glass rounded-2xl p-6 card-premium">
            <div role="img" :aria-label="t('index.starsLabel', { n: review.stars })" class="flex mb-3">
              <span v-for="s in review.stars" :key="s" class="text-yellow-300 text-lg">★</span>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed mb-5">"{{ review.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
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

    <!-- ═══════════════════════════════════════════════ -->
    <!-- TRUST & GUARANTEE                                -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="bg-surface-50 py-16 px-4 reveal">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700 mb-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            {{ t('index.guaranteeTitle') }}
          </div>
          <h2 class="text-3xl md:text-4xl font-black text-gray-900">{{ t('index.guaranteeSubtitle') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="(g, gi) in [
            { icon: 'shield-check', title: t('index.guarantee1Title'), desc: t('index.guarantee1Desc'), color: 'brand' },
            { icon: 'lock', title: t('index.guarantee2Title'), desc: t('index.guarantee2Desc'), color: 'green' },
            { icon: 'refresh', title: t('index.guarantee3Title'), desc: t('index.guarantee3Desc'), color: 'purple' },
            { icon: 'headphones', title: t('index.guarantee4Title'), desc: t('index.guarantee4Desc'), color: 'amber' },
          ]" :key="gi"
            class="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-card card-premium group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
              :class="{
                'bg-brand-50 text-brand-600': g.color === 'brand',
                'bg-green-50 text-green-600': g.color === 'green',
                'bg-purple-50 text-purple-600': g.color === 'purple',
                'bg-amber-50 text-amber-600': g.color === 'amber',
              }">
              <svg v-if="g.icon === 'shield-check'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <svg v-else-if="g.icon === 'lock'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <svg v-else-if="g.icon === 'refresh'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h3 class="font-bold text-gray-900 mb-1.5 text-sm">{{ g.title }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ g.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- FLEXIBLE BOOKING — Gradient CTA strip            -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-10 reveal">
      <div class="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-glow-lg">
        <div class="absolute right-0 top-0 bottom-0 w-1/3 opacity-10" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="w-full h-full"><circle cx="160" cy="100" r="120" fill="white"/></svg>
        </div>
        <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" aria-hidden="true"></div>
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div class="md:col-span-1">
            <h3 class="text-xl font-black mb-2">{{ t('index.flexTitle') }}</h3>
            <p class="text-brand-200 text-sm">{{ t('index.flexSubtitle') }}</p>
          </div>
          <div v-for="flex in [
            { icon: 'calendar', title: t('index.flex1Title'), desc: t('index.flex1Desc') },
            { icon: 'cash', title: t('index.flex2Title'), desc: t('index.flex2Desc') },
            { icon: 'shield', title: t('index.flex3Title'), desc: t('index.flex3Desc') },
          ]" :key="flex.title"
            class="flex items-start gap-3">
            <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <svg v-if="flex.icon === 'calendar'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <svg v-else-if="flex.icon === 'cash'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h4 class="font-bold text-sm mb-0.5">{{ flex.title }}</h4>
              <p class="text-xs text-brand-200 leading-relaxed">{{ flex.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- HOW IT WORKS — 3 step journey                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-16 reveal">
      <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">{{ t('index.howItWorksTitle') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <!-- Connecting line (desktop) -->
        <div aria-hidden="true" class="absolute top-10 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 hidden md:block rounded-full"></div>
        <div v-for="(step, si) in [
          { n: 1, title: t('index.step1Title'), desc: t('index.step1Desc'), svg: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          { n: 2, title: t('index.step2Title'), desc: t('index.step2Desc'), svg: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { n: 3, title: t('index.step3Title'), desc: t('index.step3Desc'), svg: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
        ]" :key="step.n" class="text-center relative group">
          <div class="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow relative z-10 group-hover:scale-105 transition-transform duration-300">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="step.svg" /></svg>
          </div>
          <div class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 rounded-full px-3 py-1 mb-3">
            Step {{ step.n }}
          </div>
          <h3 class="font-bold text-gray-900 mb-2 text-lg">{{ step.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- TRAVEL RESOURCES                                 -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="bg-surface-50 border-y border-gray-200/80 py-10 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-lg font-bold text-gray-900 text-center mb-6">{{ t('index.resourcesTitle') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <NuxtLink v-for="(res, ri) in [
            { to: '/visa', label: t('index.resourceVisa'), svg: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { to: '/checkin', label: t('index.resourceCheckin'), svg: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { to: '/luggage', label: t('index.resourceLuggage'), svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { to: '/flight-status', label: t('index.resourceStatus'), svg: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
            { to: '/blog', label: t('index.resourceBlog'), svg: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
          ]" :key="res.to" :to="res.to"
            class="flex flex-col items-center gap-2.5 py-5 px-3 bg-white rounded-2xl border border-gray-200 hover:border-brand-300 shadow-sm hover:shadow-card transition-all text-center group card-premium">
            <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="res.svg" /></svg>
            </div>
            <span class="text-xs font-semibold text-gray-700 group-hover:text-brand-600 transition-colors">{{ res.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- WHY YOUFLY ADVANTAGES — Dark showcase             -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-12 reveal">
      <div class="bg-surface-950 rounded-3xl p-6 md:p-10 text-white overflow-hidden relative">
        <DestinationPhoto code="DXB" :width="800" height-class="absolute inset-0 opacity-10" :no-animation="true" />
        <div class="absolute inset-0 bg-gradient-to-r from-surface-950 via-surface-950/90 to-surface-950/70"></div>
        <div class="relative z-10">
          <h2 class="text-2xl md:text-3xl font-black mb-8">{{ t('index.whyTitle') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(adv, ai) in [
              { svg: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: t('index.whyCombineTitle'), desc: t('index.whyCombineDesc') },
              { svg: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: t('index.whyFeesTitle'), desc: t('index.whyFeesDesc') },
              { svg: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('index.whyInsuranceTitle'), desc: t('index.whyInsuranceDesc') },
              { svg: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', title: t('index.whySupportTitle'), desc: t('index.whySupportDesc') },
            ]" :key="ai" class="flex items-start gap-4 glass rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
              <div class="w-11 h-11 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="adv.svg" /></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-1">{{ adv.title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed">{{ adv.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- EXCHANGE RATES + APP CTA                         -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="max-w-6xl mx-auto px-4 py-8 reveal">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-card">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="font-bold text-gray-900">{{ t('index.exchangeRates') }}</h3>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="rate in [{cur:'EUR',val:'19.50',flag:'🇪🇺'},{cur:'USD',val:'18.10',flag:'🇺🇸'},{cur:'GBP',val:'23.20',flag:'🇬🇧'}]" :key="rate.cur"
              class="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-colors">
              <div class="text-xs text-gray-400 mb-0.5">{{ rate.flag }} {{ rate.cur }}</div>
              <div class="font-black text-gray-900 text-lg">{{ rate.val }}</div>
              <div class="text-[10px] text-gray-400">MDL</div>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-br from-surface-900 to-surface-950 text-white rounded-2xl p-6 flex items-center gap-5 shadow-elevated">
          <div class="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          </div>
          <div class="flex-1">
            <h3 class="font-bold mb-1">{{ t('install.title') }}</h3>
            <p class="text-xs text-gray-400 leading-relaxed">{{ t('install.descAndroid') }}</p>
          </div>
          <div class="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0 shadow-glow hover:shadow-glow-lg">
            {{ t('install.button') }}
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- NEWSLETTER — Premium CTA                         -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="text-white py-20 px-4 relative overflow-hidden">
      <DestinationPhoto code="CDG" :width="1200" height-class="absolute inset-0" :no-animation="true" />
      <div class="absolute inset-0 bg-surface-950/90"></div>
      <div class="absolute inset-0" aria-hidden="true">
        <div class="orb w-96 h-96 bg-brand-500 top-10 left-1/4"></div>
        <div class="orb w-72 h-72 bg-accent-500 bottom-10 right-1/4" style="animation-delay: -6s"></div>
      </div>
      <div class="max-w-lg mx-auto text-center relative z-10">
        <div class="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-brand-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>
        <h2 class="text-3xl md:text-4xl font-black mb-3">{{ t('index.newsletterTitle') }}</h2>
        <p class="text-gray-400 text-sm mb-8 leading-relaxed">{{ t('index.newsletterSubtitle') }}</p>
        <form @submit.prevent="subscribeNewsletter" class="flex gap-3 max-w-md mx-auto">
          <input v-model="newsletterEmail" type="email" :placeholder="t('index.newsletterPlaceholder')"
            :aria-label="t('index.newsletterPlaceholder')" autocomplete="email"
            class="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all" />
          <button type="submit" :disabled="newsletterLoading"
            class="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shrink-0 shadow-glow hover:shadow-glow-lg">
            <span v-if="newsletterLoading" role="status" :aria-label="t('common.loading')">...</span>
            <span v-else>{{ t('index.newsletterBtn') }}</span>
          </button>
        </form>
        <p v-if="newsletterMsg" aria-live="polite" class="mt-4 text-sm" :class="newsletterSuccess ? 'text-green-400' : 'text-red-400'">{{ newsletterMsg }}</p>
        <p class="text-xs text-gray-600 mt-4">{{ t('index.newsletterUnsub') }}</p>
      </div>
    </div>
  </div>
</template>
