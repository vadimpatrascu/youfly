<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()
const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()

useWebsiteStructuredData()
useOrganizationStructuredData()

useHead({ title: computed(() => 'YouFly — ' + t('hero.title')) })

const features = computed(() => [
  { icon: '✈️', title: t('features.airlines'), desc: t('features.airlinesDesc') },
  { icon: '💰', title: t('features.prices'), desc: t('features.pricesDesc') },
  { icon: '⚡', title: t('features.fast'), desc: t('features.fastDesc') },
])

// Popular routes from Chisinau (RMO = Chisinau in Duffel)
const routeData = [
  { from: 'RMO', to: 'OTP', flag: '🇷🇴', price: '35' },
  { from: 'RMO', to: 'IST', flag: '🇹🇷', price: '32' },
  { from: 'RMO', to: 'LTN', flag: '🇬🇧', price: '39' },
  { from: 'RMO', to: 'VIE', flag: '🇦🇹', price: '39' },
  { from: 'RMO', to: 'BCN', flag: '🇪🇸', price: '31' },
  { from: 'RMO', to: 'CDG', flag: '🇫🇷', price: '73' },
  { from: 'RMO', to: 'MXP', flag: '🇮🇹', price: '59' },
  { from: 'RMO', to: 'TLV', flag: '🇮🇱', price: '45' },
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
          <span class="text-xs text-brand-300 shrink-0">{{ t('index.recentSearches') }}</span>
          <button v-for="rs in recentSearches.slice(0, 3)" :key="rs.searchedAt"
            @click="quickSearchRecent(rs)"
            :aria-label="t('index.recentSearchLabel', { from: rs.originCity, to: rs.destinationCity, date: rs.departureDate })"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full px-3 py-1.5 text-xs text-white transition-colors border border-white/20">
            <span aria-hidden="true">✈</span>
            <span>{{ rs.originCity }} <span aria-hidden="true">→</span> {{ rs.destinationCity }}</span>
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
        <span aria-hidden="true" class="text-red-500">♥</span> {{ t('index.savedFavorites') }}
      </h2>
      <div class="flex gap-2 flex-wrap">
        <div v-for="fav in favorites" :key="fav.from + fav.to"
          class="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-400 rounded-full px-4 py-2 text-sm transition-colors">
          <button @click="quickSearch({ from: fav.from, fromCity: fav.fromCity, to: fav.to, toCity: fav.toCity, flag: '', price: '' })"
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

    <!-- Popular routes -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ t('popularRoutes') }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          v-for="route in popularRoutes"
          :key="route.to"
          class="bg-white rounded-2xl border border-gray-200 hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div class="relative p-4">
            <div v-if="searchingRoute === route.to" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
              <div role="status" :aria-label="t('common.loading')" class="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="flex items-start justify-between mb-1">
              <span aria-hidden="true" class="text-2xl">{{ route.flag }}</span>
              <button
                @click.stop="toggleFavorite({ from: route.from, fromCity: route.fromCity, to: route.to, toCity: route.toCity })"
                class="text-lg transition-colors"
                :class="isFavorite(route.from, route.to) ? 'text-red-500' : 'text-gray-200 group-hover:text-gray-300'"
                :aria-label="isFavorite(route.from, route.to) ? t('index.favoriteRemoveRoute', { from: route.fromCity, to: route.toCity }) : t('index.favoriteAdd')"
                :aria-pressed="isFavorite(route.from, route.to)">
                <span aria-hidden="true">♥</span>
              </button>
            </div>
            <button @click="quickSearch(route)" :disabled="searchingRoute !== null"
              :aria-label="t('index.searchRouteLabel', { from: route.fromCity, to: route.toCity })"
              class="w-full text-left relative disabled:opacity-60 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded-lg">
              <div class="font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{{ route.toCity }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ route.fromCity }} <span aria-hidden="true">→</span></div>
              <div class="mt-2 text-brand-600 font-bold text-sm">{{ t('index.fromPrice') }}{{ route.price }}</div>
            </button>
          </div>
        </div>
        <p v-if="searchRouteError" role="alert" class="col-span-full text-red-600 text-sm text-center">{{ searchRouteError }}</p>
      </div>
    </div>

    <!-- Features -->
    <div class="bg-white border-y border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="f in features" :key="f.title" class="text-center p-6">
            <div aria-hidden="true" class="text-5xl mb-4">{{ f.icon }}</div>
            <h3 class="font-bold text-gray-900 mb-2 text-lg">{{ f.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust strip -->
    <div class="max-w-6xl mx-auto px-4 py-10 text-center">
      <p class="text-sm text-gray-400 mb-4">{{ t('index.trustedPartner') }}</p>
      <div role="img" :aria-label="t('index.airlinesLabel')" class="flex items-center justify-center gap-8 opacity-40 grayscale">
        <span aria-hidden="true" class="text-2xl font-bold tracking-wide">TAROM</span>
        <span aria-hidden="true" class="text-2xl font-bold tracking-wide">TURKISH</span>
        <span aria-hidden="true" class="text-2xl font-bold tracking-wide">RYANAIR</span>
        <span aria-hidden="true" class="text-2xl font-bold tracking-wide">WIZZ</span>
        <span aria-hidden="true" class="text-2xl font-bold tracking-wide">LOT</span>
      </div>
    </div>
  
    <!-- Testimonials -->
    <div class="bg-brand-600 text-white py-14 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-center mb-8 text-white">{{ t('index.testimonialsTitle') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="review in [
            { name: 'Maria C.', city: t('index.cityRMO'), text: t('index.review1'), stars: 5 },
            { name: 'Alexandru P.', city: t('index.cityBalti'), text: t('index.review2'), stars: 5 },
            { name: 'Elena M.', city: t('index.cityRMO'), text: t('index.review3'), stars: 5 },
          ]" :key="review.name"
            class="bg-white/10 backdrop-blur rounded-2xl p-5">
            <div role="img" :aria-label="t('index.starsLabel', { n: review.stars })" class="flex mb-3">
              <span v-for="s in review.stars" :key="s" aria-hidden="true" class="text-yellow-300 text-lg">★</span>
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
      <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">{{ t('index.howItWorksTitle') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ t('index.step1Title') }}</h3>
          <p class="text-gray-500 text-sm">{{ t('index.step1Desc') }}</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ t('index.step2Title') }}</h3>
          <p class="text-gray-500 text-sm">{{ t('index.step2Desc') }}</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ t('index.step3Title') }}</h3>
          <p class="text-gray-500 text-sm">{{ t('index.step3Desc') }}</p>
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

    <!-- Newsletter -->
    <div class="bg-gray-900 text-white py-14 px-4">
      <div class="max-w-lg mx-auto text-center">
        <div aria-hidden="true" class="text-4xl mb-4">✉️</div>
        <h2 class="text-2xl font-bold mb-3">{{ t('index.newsletterTitle') }}</h2>
        <p class="text-gray-400 text-sm mb-6">{{ t('index.newsletterSubtitle') }}</p>
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
