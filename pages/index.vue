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
    <!-- Hero — Cinematic -->
    <div class="relative overflow-hidden bg-gray-950 text-white">
      <!-- Cinematic sky photo + animated particles -->
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src="https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=1400&q=80"
          alt="" class="absolute inset-0 w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" />
        <div class="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-brand-900/60 to-gray-950"></div>
        <!-- Floating particles -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <!-- Flight path arcs -->
        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path d="M-50,400 Q300,100 600,200 Q900,300 1250,100" fill="none" stroke="rgba(14,165,233,0.15)" stroke-width="1" class="flight-path" />
          <path d="M-50,450 Q400,150 700,250 Q1000,350 1250,50" fill="none" stroke="rgba(14,165,233,0.08)" stroke-width="1" class="flight-path" style="animation-delay: -7s" />
        </svg>
        <!-- Horizon glow -->
        <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-600/20 to-transparent"></div>
      </div>

      <div class="relative z-10 py-14 md:py-20 px-4">
        <div class="max-w-6xl mx-auto text-center mb-8">
          <div class="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium text-brand-300 mb-5 animate-fade-in">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Chișinău (KIV) — 25+ companii aeriene
          </div>
          <h1 class="text-4xl sm:text-5xl md:text-7xl font-black mb-5 leading-[1.08] tracking-tight">
            <span class="block text-shimmer">{{ t('hero.title') }}</span>
          </h1>
          <p class="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">{{ t('hero.subtitle') }}</p>
        </div>
        <SearchForm />

        <!-- Recent searches -->
        <div v-if="recentSearches.length" class="max-w-4xl mx-auto mt-6 px-4">
          <div class="flex items-center gap-3 flex-wrap justify-center">
            <span class="text-xs text-gray-500 shrink-0">{{ t('index.recentSearches') }}</span>
            <button v-for="rs in recentSearches.slice(0, 3)" :key="rs.searchedAt"
              @click="quickSearchRecent(rs)"
              :aria-label="t('index.recentSearchLabel', { from: rs.originCity, to: rs.destinationCity, date: rs.departureDate })"
              class="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-gray-300 transition-all border border-white/10 hover:border-white/20">
              <span aria-hidden="true" class="text-brand-400">✈</span>
              <span>{{ rs.originCity }} <span aria-hidden="true" class="text-gray-600">→</span> {{ rs.destinationCity }}</span>
            </button>
          </div>
        </div>

        <!-- Stats — glass cards -->
        <div class="max-w-3xl mx-auto mt-10 grid grid-cols-3 gap-3">
          <div v-for="stat in stats" :key="stat.value" class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 py-3 px-3 text-center hover:bg-white/10 transition-colors">
            <div class="text-xl md:text-2xl font-black text-white">{{ stat.value }}</div>
            <div class="text-[10px] md:text-xs text-gray-500 mt-0.5">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Saved favorites -->
    <div v-if="favorites.length" class="max-w-6xl mx-auto px-4 pt-8">
      <h2 class="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span aria-hidden="true" class="text-red-500">♥</span> {{ t('index.savedFavorites') }}
      </h2>
      <div class="flex gap-2 flex-wrap">
        <div v-for="fav in favorites" :key="fav.from + fav.to"
          class="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-400 rounded-full px-4 py-2 text-sm transition-colors">
          <button @click="quickSearch({ from: fav.from, fromCity: fav.fromCity, to: fav.to, toCity: fav.toCity, flag: '', price: '', duration: '' })"
            :aria-label="t('index.searchRouteLabel', { from: fav.fromCity, to: fav.toCity })"
            class="flex items-center gap-2">
            <span class="font-semibold text-gray-700">{{ fav.fromCity }}</span>
            <span aria-hidden="true" class="text-gray-400">→</span>
            <span class="font-semibold text-brand-600">{{ fav.toCity }}</span>
          </button>
          <button @click.stop="toggleFavorite(fav)" :aria-label="t('index.favoriteRemoveRoute', { from: fav.fromCity, to: fav.toCity })" class="text-red-400 hover:text-red-600 ml-1 text-xs"><span aria-hidden="true">✕</span></button>
        </div>
      </div>
    </div>

    <!-- Price trends -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PriceTrends />
        <!-- Quick tip -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6">
          <div aria-hidden="true" class="text-3xl mb-3">💡</div>
          <h3 class="font-bold text-gray-900 mb-3">{{ t('index.priceTips') }}</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2"><span aria-hidden="true" class="text-green-500 shrink-0 mt-0.5">✓</span> {{ t('index.tip1') }}</li>
            <li class="flex items-start gap-2"><span aria-hidden="true" class="text-green-500 shrink-0 mt-0.5">✓</span> {{ t('index.tip2') }}</li>
            <li class="flex items-start gap-2"><span aria-hidden="true" class="text-green-500 shrink-0 mt-0.5">✓</span> {{ t('index.tip3') }}</li>
            <li class="flex items-start gap-2"><span aria-hidden="true" class="text-green-500 shrink-0 mt-0.5">✓</span> {{ t('index.tip4') }}</li>
            <li class="flex items-start gap-2"><span aria-hidden="true" class="text-green-500 shrink-0 mt-0.5">✓</span> {{ t('index.tip5') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Popular routes — Immersive destination cards -->
    <div class="max-w-6xl mx-auto px-4 py-12 reveal">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-black text-gray-900 mb-2">{{ t('popularRoutes') }}</h2>
        <p class="text-gray-500 text-sm">{{ t('destinations.subtitle') }}</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="(route, ri) in popularRoutes"
          :key="route.to"
          class="group relative rounded-2xl overflow-hidden cursor-pointer reveal hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-52 md:h-56"
          :style="`transition-delay: ${ri * 0.05}s`"
        >
          <!-- Destination photo background -->
          <DestinationPhoto :code="route.to" height-class="absolute inset-0" :no-animation="true" />
          <!-- Loading overlay -->
          <div v-if="searchingRoute === route.to" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <div role="status" :aria-label="t('common.loading')" class="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <!-- Content overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5"></div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <!-- Favorite button -->
            <button
              @click.stop="toggleFavorite({ from: route.from, fromCity: route.fromCity, to: route.to, toCity: route.toCity })"
              class="absolute top-3 right-3 text-lg transition-all z-10"
              :class="isFavorite(route.from, route.to) ? 'text-red-400 scale-110' : 'text-white/30 hover:text-white/60'"
              :aria-label="isFavorite(route.from, route.to) ? t('index.favoriteRemoveRoute', { from: route.fromCity, to: route.toCity }) : t('index.favoriteAdd')"
              :aria-pressed="isFavorite(route.from, route.to)">
              <span aria-hidden="true">♥</span>
            </button>

            <button @click="quickSearch(route)" :disabled="searchingRoute !== null"
              :aria-label="t('index.searchRouteLabel', { from: route.fromCity, to: route.toCity })"
              class="w-full text-left relative disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg">
              <div class="flex items-center gap-1.5 mb-1">
                <span aria-hidden="true" class="text-lg">{{ route.flag }}</span>
                <span class="font-black text-white text-lg group-hover:text-brand-300 transition-colors leading-tight">{{ route.toCity }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ route.fromCity }} <span aria-hidden="true">→</span></span>
                <span class="text-brand-400 font-black text-sm">{{ t('index.fromPrice') }}{{ route.price }}</span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span v-if="route.duration" class="text-[10px] text-gray-500">⏱ {{ route.duration }}</span>
                <span class="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-semibold">Direct</span>
              </div>
            </button>
          </div>
        </div>
        <p v-if="searchRouteError" role="alert" class="col-span-full text-red-600 text-sm text-center">{{ searchRouteError }}</p>
      </div>
    </div>

    <!-- Features -->
    <div class="bg-gradient-to-b from-white to-gray-50 reveal">
      <div class="max-w-6xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(f, fi) in features" :key="f.title"
            class="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
              :class="fi === 0 ? 'from-brand-400 to-brand-600' : fi === 1 ? 'from-emerald-400 to-emerald-600' : 'from-amber-400 to-amber-600'"></div>
            <div aria-hidden="true" class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
              :class="fi === 0 ? 'bg-brand-50 text-brand-600' : fi === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" :stroke="fi === 0 ? '#0284c7' : fi === 1 ? '#059669' : '#d97706'" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="f.svg" /></svg>
            </div>
            <h3 class="font-black text-gray-900 mb-2 text-lg">{{ f.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Social proof strip (inspired by zbor.md trust signals) -->
    <div class="bg-gray-950 py-8 px-4 reveal">
      <div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
        <div ref="countDestEl">
          <div class="text-3xl md:text-4xl font-black text-brand-400">{{ countDest }}+</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('index.statDestinations') }}</div>
        </div>
        <div ref="countAirlinesEl">
          <div class="text-3xl md:text-4xl font-black text-brand-400">{{ countAirlines }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('index.statAirlines') }}</div>
        </div>
        <div>
          <div class="text-3xl md:text-4xl font-black text-brand-400">4.9<span class="text-lg">★</span></div>
          <div class="text-xs text-gray-500 mt-1">177 reviews</div>
        </div>
        <div ref="countCountriesEl">
          <div class="text-3xl md:text-4xl font-black text-brand-400">{{ countCountries }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('airports.countries') }}</div>
        </div>
      </div>
    </div>

    <!-- Airlines strip — real logos from Duffel CDN -->
    <div class="max-w-6xl mx-auto px-4 py-10 text-center">
      <p class="text-xs text-gray-400 mb-6 uppercase tracking-widest font-medium">{{ t('index.trustedPartner') }} — 25+ {{ t('about.stat1Label').toLowerCase() }}</p>
      <div :aria-label="t('index.airlinesLabel')" class="flex items-center justify-center gap-5 md:gap-8 flex-wrap">
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
            class="h-7 md:h-8 w-auto opacity-30 group-hover:opacity-70 transition-opacity duration-300 grayscale group-hover:grayscale-0"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'" />
        </div>
      </div>
    </div>
  
    <!-- Testimonials -->
    <div class="text-white py-16 px-4 reveal relative overflow-hidden">
      <DestinationPhoto code="AMS" :width="1200" height-class="absolute inset-0" :no-animation="true" />
      <div class="absolute inset-0 bg-gray-950/85"></div>
      <div class="max-w-6xl mx-auto relative z-10">
        <h2 class="text-2xl font-bold text-center mb-2 text-white">{{ t('index.testimonialsTitle') }}</h2>
        <div class="flex items-center justify-center gap-2 mb-8">
          <span class="text-yellow-300 text-lg">★★★★★</span>
          <span class="text-white font-black text-lg">4.97</span>
          <span class="text-gray-400 text-sm">/ 5 · 177 reviews</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="review in [
            { name: 'Maria C.', city: t('index.cityRMO'), text: t('index.review1'), stars: 5 },
            { name: 'Alexandru P.', city: t('index.cityBalti'), text: t('index.review2'), stars: 5 },
            { name: 'Elena M.', city: t('index.cityRMO'), text: t('index.review3'), stars: 5 },
          ]" :key="review.name"
            class="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-6">
            <div role="img" :aria-label="t('index.starsLabel', { n: review.stars })" class="flex mb-3">
              <span v-for="s in review.stars" :key="s" aria-hidden="true" class="text-yellow-300 text-lg">★</span>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed mb-4">"{{ review.text }}"</p>
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

    <!-- Trust & Guarantee section (inspired by sky.md guarantee) -->
    <div class="bg-gradient-to-b from-gray-50 to-white py-16 px-4 reveal">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700 mb-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            {{ t('index.guaranteeTitle') }}
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-2">{{ t('index.guaranteeSubtitle') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(g, gi) in [
            { icon: 'shield-check', title: t('index.guarantee1Title'), desc: t('index.guarantee1Desc'), color: 'brand' },
            { icon: 'lock', title: t('index.guarantee2Title'), desc: t('index.guarantee2Desc'), color: 'green' },
            { icon: 'refresh', title: t('index.guarantee3Title'), desc: t('index.guarantee3Desc'), color: 'purple' },
            { icon: 'headphones', title: t('index.guarantee4Title'), desc: t('index.guarantee4Desc'), color: 'amber' },
          ]" :key="gi"
            class="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
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

    <!-- Flexible booking strip (inspired by sky.md COVID refund section) -->
    <div class="max-w-6xl mx-auto px-4 py-8 reveal">
      <div class="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
        <div class="absolute right-0 top-0 bottom-0 w-1/3 opacity-10" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="w-full h-full"><circle cx="160" cy="100" r="120" fill="white"/></svg>
        </div>
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

    <!-- How it works — journey-like steps -->
    <div class="max-w-6xl mx-auto px-4 py-16 reveal">
      <h2 class="text-3xl font-black text-gray-900 mb-10 text-center">{{ t('index.howItWorksTitle') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <!-- Connecting line (desktop) -->
        <div aria-hidden="true" class="absolute top-6 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 hidden md:block"></div>
        <div v-for="(step, si) in [
          { n: 1, icon: '🔍', title: t('index.step1Title'), desc: t('index.step1Desc') },
          { n: 2, icon: '⚡', title: t('index.step2Title'), desc: t('index.step2Desc') },
          { n: 3, icon: '✈️', title: t('index.step3Title'), desc: t('index.step3Desc') },
        ]" :key="step.n" class="text-center relative">
          <div class="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg relative z-10">
            <span aria-hidden="true">{{ step.icon }}</span>
          </div>
          <h3 class="font-bold text-gray-900 mb-2">{{ step.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Travel resources strip -->
    <div class="bg-gray-50 border-y border-gray-200 py-8 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-lg font-bold text-gray-900 text-center mb-5">{{ t('index.resourcesTitle') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <NuxtLink v-for="res in [
            { to: '/visa', icon: '🛂', label: t('index.resourceVisa') },
            { to: '/checkin', icon: '🎫', label: t('index.resourceCheckin') },
            { to: '/luggage', icon: '🧳', label: t('index.resourceLuggage') },
            { to: '/flight-status', icon: '✈️', label: t('index.resourceStatus') },
            { to: '/blog', icon: '📖', label: t('index.resourceBlog') },
          ]" :key="res.to" :to="res.to"
            class="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-xl border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all text-center group">
            <span aria-hidden="true" class="text-2xl">{{ res.icon }}</span>
            <span class="text-xs font-semibold text-gray-700 group-hover:text-brand-600 transition-colors">{{ res.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Why YouFly advantages (inspired by sky.md service section) -->
    <div class="max-w-6xl mx-auto px-4 py-10 reveal">
      <div class="bg-gray-950 rounded-3xl p-6 md:p-8 text-white overflow-hidden relative">
        <DestinationPhoto code="DXB" :width="800" height-class="absolute inset-0 opacity-10" :no-animation="true" />
        <div class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/70"></div>
        <div class="relative z-10">
          <h2 class="text-2xl font-black mb-6">{{ t('index.whyTitle') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="(adv, ai) in [
              { svg: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: t('index.whyCombineTitle'), desc: t('index.whyCombineDesc') },
              { svg: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: t('index.whyFeesTitle'), desc: t('index.whyFeesDesc') },
              { svg: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('index.whyInsuranceTitle'), desc: t('index.whyInsuranceDesc') },
              { svg: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', title: t('index.whySupportTitle'), desc: t('index.whySupportDesc') },
            ]" :key="ai" class="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div class="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="adv.svg" /></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm mb-0.5">{{ adv.title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed">{{ adv.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exchange rates + app download strip -->
    <div class="max-w-6xl mx-auto px-4 py-8 reveal">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Exchange rates -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="flex items-center gap-2 mb-3">
            <span aria-hidden="true" class="text-xl">💱</span>
            <h3 class="font-bold text-gray-900 text-sm">{{ t('index.exchangeRates') }}</h3>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div v-for="rate in [{cur:'EUR',val:'19.50',flag:'🇪🇺'},{cur:'USD',val:'18.10',flag:'🇺🇸'},{cur:'GBP',val:'23.20',flag:'🇬🇧'}]" :key="rate.cur"
              class="bg-gray-50 rounded-xl p-3 text-center">
              <div class="text-xs text-gray-400">{{ rate.flag }} {{ rate.cur }}</div>
              <div class="font-black text-gray-900">{{ rate.val }}</div>
              <div class="text-[10px] text-gray-400">MDL</div>
            </div>
          </div>
        </div>
        <!-- Install app CTA -->
        <div class="bg-gray-950 text-white rounded-2xl p-5 flex items-center gap-4">
          <div aria-hidden="true" class="text-4xl shrink-0">📲</div>
          <div class="flex-1">
            <h3 class="font-bold text-sm mb-1">{{ t('install.title') }}</h3>
            <p class="text-xs text-gray-400 leading-relaxed">{{ t('install.descAndroid') }}</p>
          </div>
          <div class="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0">
            {{ t('install.button') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Newsletter -->
    <div class="text-white py-16 px-4 relative overflow-hidden">
      <DestinationPhoto code="CDG" :width="1200" height-class="absolute inset-0" :no-animation="true" />
      <div class="absolute inset-0 bg-gray-950/85"></div>
      <div class="absolute inset-0 opacity-10" aria-hidden="true">
        <div class="absolute top-10 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      <div class="max-w-lg mx-auto text-center relative z-10">
        <div aria-hidden="true" class="text-5xl mb-5">✈️</div>
        <h2 class="text-3xl font-black mb-3">{{ t('index.newsletterTitle') }}</h2>
        <p class="text-gray-400 text-sm mb-8">{{ t('index.newsletterSubtitle') }}</p>
        <form @submit.prevent="subscribeNewsletter" class="flex gap-3 max-w-sm mx-auto">
          <input v-model="newsletterEmail" type="email" :placeholder="t('index.newsletterPlaceholder')"
            :aria-label="t('index.newsletterPlaceholder')" autocomplete="email"
            class="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button type="submit" :disabled="newsletterLoading"
            class="px-5 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors shrink-0">
            <span v-if="newsletterLoading" role="status" :aria-label="t('common.loading')"><span aria-hidden="true">...</span></span>
            <span v-else>{{ t('index.newsletterBtn') }}</span>
          </button>
        </form>
        <p v-if="newsletterMsg" aria-live="polite" class="mt-3 text-sm" :class="newsletterSuccess ? 'text-green-400' : 'text-red-400'">{{ newsletterMsg }}</p>
        <p class="text-xs text-gray-600 mt-3">{{ t('index.newsletterUnsub') }}</p>
      </div>
    </div>
</div>
</template>
