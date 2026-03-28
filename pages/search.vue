<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useOffersStore } from '~/stores/offers'
import { useBookingStore } from '~/stores/booking'

const { t } = useI18n()

const cabinLabels = computed<Record<string, string>>(() => ({
  economy: t('search.economy'),
  premium_economy: t('search.premiumEconomy'),
  business: t('search.business'),
  first: t('search.first'),
}))

const searchStore = useSearchStore()
const offersStore = useOffersStore()
const bookingStore = useBookingStore()

useHead({
  title: computed(() => {
    const from = searchStore.origin?.city_name
    const to = searchStore.destination?.city_name
    if (from && to) return `${from} → ${to} — YouFly`
    return `${t('results.title')} — YouFly`
  }),
  meta: [{ name: 'robots', content: 'noindex' }],
})
const router = useRouter()
const route = useRoute()
const { trackSearch, trackSelectOffer } = useAnalytics()
const { replaceSearchInUrl } = useUrlSearch()

onMounted(async () => {
  // Restore search from URL query params (enables shareable links)
  const q = route.query
  if (q.from && q.to && q.dep && !searchStore.offerRequestId) {
    const from = String(q.from).toUpperCase().substring(0, 3)
    const to = String(q.to).toUpperCase().substring(0, 3)
    const dep = String(q.dep)
    searchStore.origin = { iata_code: '', airport_iata: from, name: from, city_name: from, country_code: '' }
    searchStore.destination = { iata_code: '', airport_iata: to, name: to, city_name: to, country_code: '' }
    searchStore.departureDate = dep
    if (q.ret) searchStore.returnDate = String(q.ret)
    if (q.adults) searchStore.adults = Math.min(9, Math.max(1, Number(q.adults) || 1))
    if (q.children) searchStore.children = Math.min(9, Math.max(0, Number(q.children) || 0))
    if (q.infants) searchStore.infants = Math.min(4, Math.max(0, Number(q.infants) || 0))
    if (q.cabin) searchStore.cabinClass = String(q.cabin)
    if (q.type) searchStore.tripType = q.type === 'return' ? 'return' : 'oneway'
    await searchStore.submitSearch()
  }

  if (!searchStore.offerRequestId) return router.push('/')
  if (offersStore.all.length === 0) {
    await offersStore.loadOffers(searchStore.offerRequestId)
  }
  // Sync current search to URL if not already there
  if (!q.from && searchStore.origin && searchStore.destination) {
    replaceSearchInUrl({
      from: searchStore.origin.airport_iata || searchStore.origin.iata_code,
      to: searchStore.destination.airport_iata || searchStore.destination.iata_code,
      dep: searchStore.departureDate,
      ret: searchStore.returnDate || undefined,
      adults: searchStore.adults,
      children: searchStore.children,
      infants: searchStore.infants,
      cabin: searchStore.cabinClass,
      type: searchStore.tripType,
    })
  }
  trackSearch(
    searchStore.origin?.city_name || '',
    searchStore.destination?.city_name || '',
    searchStore.departureDate,
    searchStore.adults + searchStore.children + searchStore.infants
  )
})

function selectOffer(offer: any) {
  const airline = offer.slices?.[0]?.segments?.[0]?.carrier_name || ''
  trackSelectOffer(offer.id, parseFloat(offer.total_amount), offer.total_currency, airline)
  bookingStore.selectOffer(offer)
  router.push('/ticket-order')
}

const showFilters = ref(false)
const showModifySearch = ref(false)
const filterCloseBtn = ref<HTMLButtonElement>()
let filterPrevFocus: HTMLElement | null = null
function onFilterKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') showFilters.value = false
}

watch(showFilters, async (val) => {
  if (val) {
    filterPrevFocus = document.activeElement as HTMLElement
    await nextTick()
    filterCloseBtn.value?.focus()
  } else {
    filterPrevFocus?.focus()
    filterPrevFocus = null
  }
})

const { formatPrice } = useFormatters()

const totalPassengers = computed(() => searchStore.adults + searchStore.children + searchStore.infants)

// Find cheapest offer id for badge
const cheapestOfferId = computed(() => {
  if (!offersStore.filtered.length) return null
  return offersStore.filtered.reduce((min, o) =>
    parseFloat(o.total_amount) < parseFloat(min.total_amount) ? o : min
  ).id
})

// Pagination
const PAGE_SIZE = 10
const visibleCount = ref(PAGE_SIZE)
const visibleOffers = computed(() => offersStore.filtered.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < offersStore.filtered.length)

function loadMore() {
  visibleCount.value += PAGE_SIZE
}

// Reset pagination when filters change
watch(() => offersStore.filtered.length, () => { visibleCount.value = PAGE_SIZE })
</script>

<template>
  <div>
    <!-- Compact search bar -->
    <div class="bg-gray-950 border-b border-white/10 py-3 px-4">
      <div class="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        <button @click="showModifySearch = !showModifySearch"
          :aria-expanded="showModifySearch"
          aria-controls="modify-search-panel"
          class="flex-1 min-w-0 flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-left transition-colors">
          <span aria-hidden="true" class="text-brand-400 shrink-0">✈</span>
          <div class="min-w-0">
            <div class="font-bold text-white text-sm truncate">
              {{ searchStore.origin?.city_name || '?' }} <span aria-hidden="true" class="text-gray-500">→</span> {{ searchStore.destination?.city_name || '?' }}
            </div>
            <div class="text-xs text-gray-500 truncate">
              {{ searchStore.departureDate }}
              <span v-if="searchStore.tripType === 'return' && searchStore.returnDate"> · {{ searchStore.returnDate }}</span>
              · {{ totalPassengers }} {{ totalPassengers === 1 ? t('search.passenger') : t('search.passengers_plural') }}
              · {{ cabinLabels[searchStore.cabinClass] || searchStore.cabinClass }}
            </div>
          </div>
          <span class="text-gray-500 text-xs ml-auto shrink-0">{{ t('results.modify') }}</span>
        </button>
        <button @click="showFilters = !showFilters" :aria-expanded="showFilters" :aria-label="t('results.filters')" class="md:hidden px-4 py-2.5 text-sm bg-brand-600 text-white rounded-xl shrink-0 flex items-center gap-1.5">
          {{ t('results.filters') }}
          <span v-if="offersStore.filters.stops.length + offersStore.filters.airlines.length + (offersStore.filters.maxPrice ? 1 : 0) + (offersStore.filters.maxDuration ? 1 : 0) + offersStore.filters.timeSlots.length > 0"
            class="bg-white text-brand-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {{ offersStore.filters.stops.length + offersStore.filters.airlines.length + (offersStore.filters.maxPrice ? 1 : 0) + (offersStore.filters.maxDuration ? 1 : 0) + offersStore.filters.timeSlots.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Expandable search modification -->
    <div v-if="showModifySearch" id="modify-search-panel" role="dialog" :aria-label="t('results.modify')" class="bg-gray-900 py-6 px-4 border-b border-white/10">
      <div class="max-w-6xl mx-auto">
        <SearchForm />
      </div>
    </div>

    <!-- Price guarantee strip -->
    <div v-if="!offersStore.isLoading && offersStore.filtered.length > 0"
      class="bg-green-50 border-b border-green-100 py-2 px-4 text-center text-xs text-green-700 font-medium flex items-center justify-center gap-3 flex-wrap">
      <span>{{ t('results.priceGuarantee') }}</span>
      <span class="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">Mix & Match</span>
    </div>

    <!-- Destination photo strip -->
    <DestinationPhoto v-if="searchStore.destination" :code="searchStore.destination.airport_iata || searchStore.destination.iata_code || ''" :width="1200" height-class="h-24 md:h-32">
      <div class="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/80"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
      <div class="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <span class="font-black text-xl tracking-wider drop-shadow-lg">
          {{ searchStore.origin?.city_name || searchStore.origin?.airport_iata }}
          <span aria-hidden="true" class="mx-2 text-brand-400">✈</span>
          {{ searchStore.destination?.city_name || searchStore.destination?.airport_iata }}
        </span>
        <span v-if="searchStore.departureDate" class="text-xs text-gray-400 mt-1 drop-shadow">
          {{ searchStore.departureDate }}
          <span v-if="searchStore.tripType === 'return' && searchStore.returnDate"> — {{ searchStore.returnDate }}</span>
          <span class="mx-1.5">·</span>
          {{ cabinLabels[searchStore.cabinClass] || searchStore.cabinClass }}
        </span>
      </div>
    </DestinationPhoto>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p class="text-sm text-gray-500" aria-live="polite" aria-atomic="true">
          <span v-if="!offersStore.isLoading" class="font-semibold text-gray-800">{{ offersStore.filtered.length }}</span>
          <span v-if="!offersStore.isLoading"> {{ t('results.flightsFound') }}</span>
          <span v-else>{{ t('results.loading') }}</span>
        </p>
        <div v-if="!offersStore.isLoading && offersStore.filtered.length > 0" class="text-xs text-gray-400 flex items-center gap-3 flex-wrap">
          <span>{{ t('results.fromPrice') }} <span class="font-semibold text-gray-700">{{ formatPrice(offersStore.priceRange.min.toString(), offersStore.filtered[0]?.total_currency || 'EUR') }}</span>
          {{ t('results.toPrice') }} <span class="font-semibold text-gray-700">{{ formatPrice(offersStore.priceRange.max.toString(), offersStore.filtered[0]?.total_currency || 'EUR') }}</span></span>
          <span v-if="offersStore.uniqueAirlinesWithCode.length" class="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{{ offersStore.uniqueAirlinesWithCode.length }} {{ t('about.stat1Label').toLowerCase() }}</span>
          <span class="bg-green-50 px-2 py-0.5 rounded text-green-600">{{ offersStore.filtered.filter(o => o.slices.every((s: any) => s.stops === 0)).length }} {{ t('flightCard.direct').toLowerCase() }}</span>
        </div>
      </div>

      <!-- Hopper-style "Buy now or wait" recommendation -->
      <div v-if="!offersStore.isLoading && offersStore.filtered.length > 0"
        class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold text-green-800">{{ t('results.buyNowTitle') }}</p>
          <p class="text-xs text-green-600 mt-0.5">{{ t('results.buyNowDesc') }}</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-xs text-green-600 font-bold">95%</div>
          <div class="text-[10px] text-green-500">{{ t('results.confidence') }}</div>
        </div>
      </div>

      <!-- Price alert banner -->
      <PriceAlertBanner v-if="!offersStore.isLoading && offersStore.filtered.length > 0" class="mb-4" />

      <!-- Quick sort pills -->
      <div role="group" :aria-label="t('results.sortGroupLabel')" class="flex gap-2 mb-4 flex-wrap">
        <button v-for="s in [
          { v: 'price', l: t('filters.cheapest') },
          { v: 'duration', l: t('filters.fastest') },
          { v: 'departure', l: t('filters.earliest') }
        ]" :key="s.v"
          @click="offersStore.sortBy = s.v as any; offersStore.applyFilters()"
          :aria-pressed="offersStore.sortBy === s.v"
          class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
          :class="offersStore.sortBy === s.v
            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
            : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400'">
          {{ s.l }}
        </button>
      </div>

      <FlightCompareDrawer @select="selectOffer($event)" />
      <div class="flex gap-6">
        <div class="hidden md:block w-64 shrink-0 self-start sticky top-24">
          <FilterSidebar />
        </div>

        <!-- Mobile filter overlay -->
        <Teleport to="body">
          <Transition name="filter-overlay">
            <div v-if="showFilters" class="fixed inset-0 z-50 md:hidden bg-black/50" @click="showFilters = false" @keydown="onFilterKeydown">
              <Transition name="filter-panel">
                <div v-if="showFilters" role="dialog" aria-labelledby="mobile-filter-title" aria-modal="true"
                  class="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gray-900 p-4 overflow-y-auto shadow-2xl shadow-black/50 pb-safe" @click.stop>
                  <div class="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 py-2 -mt-2 -mx-4 px-4 border-b border-gray-800 z-10">
                    <h3 id="mobile-filter-title" class="font-semibold text-white">{{ t('filters.title') }}</h3>
                    <button ref="filterCloseBtn" @click="showFilters = false" :aria-label="t('common.close')"
                      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 text-gray-400 text-xl transition-colors">
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                  <FilterSidebar :dark="true" />
                </div>
              </Transition>
            </div>
          </Transition>
        </Teleport>

        <div class="flex-1 space-y-3 min-w-0">
          <template v-if="offersStore.isLoading">
            <FlightCardSkeleton v-for="i in 6" :key="i" />
          </template>

          <div v-else-if="offersStore.error" role="alert" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-red-100 flex items-center justify-center">
              <svg class="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
            </div>
            <p class="text-red-600 font-medium mb-4">{{ offersStore.error }}</p>
            <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm">{{ t('results.modify') }}</button>
          </div>

          <div v-else-if="!offersStore.filtered.length" class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ t('results.noFlights') }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ t('results.noFlightsDesc') }}</p>
            <div class="flex gap-3 justify-center flex-wrap mb-5">
              <button @click="offersStore.clearFilters()" class="px-6 py-2 border border-brand-600 text-brand-600 rounded-xl text-sm hover:bg-brand-50 transition-colors">{{ t('results.clearFilters') }}</button>
              <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 transition-colors">{{ t('results.modify') }}</button>
            </div>
            <div v-if="offersStore.all.length > 0" class="mb-4">
              <p class="text-xs text-gray-400 mb-2">
                {{ offersStore.all.length }} {{ t('results.available') }}
              </p>
              <!-- Show which filters are active -->
              <div class="flex gap-1.5 justify-center flex-wrap">
                <span v-if="offersStore.filters.maxPrice" class="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                  {{ t('filters.maxPrice') }}: €{{ offersStore.filters.maxPrice }}
                </span>
                <span v-if="offersStore.filters.stops.length" class="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                  {{ t('filters.stops') }}: {{ offersStore.filters.stops.join(', ') }}
                </span>
                <span v-if="offersStore.filters.airlines.length" class="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                  {{ t('filters.airlines') }}: {{ offersStore.filters.airlines.join(', ') }}
                </span>
                <span v-if="offersStore.filters.maxDuration" class="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">
                  {{ t('filters.duration') }}: {{ offersStore.filters.maxDuration }}h
                </span>
              </div>
            </div>
            <!-- Alternative date suggestions when truly no results -->
            <div v-if="!offersStore.all.length" class="border-t pt-5">
              <p class="text-sm text-gray-500 mb-3">{{ t('results.tryDates') }}:</p>
              <div class="flex gap-2 justify-center flex-wrap">
                <button v-for="d in [1, 2, 3, 7, 14]" :key="d"
                  @click="() => { const dd = new Date(searchStore.departureDate || Date.now()); dd.setDate(dd.getDate() + d); searchStore.departureDate = dd.toISOString().split('T')[0]; searchStore.submitSearch() }"
                  class="px-3 py-1.5 text-xs border border-gray-200 rounded-full hover:border-brand-400 text-gray-600 transition-colors">
                  +{{ d }} {{ d === 1 ? t('results.day') : t('results.days') }}
                </button>
              </div>
            </div>
          </div>

          <template v-else>
            <div v-for="offer in visibleOffers" :key="offer.id" class="relative">
              <div v-if="offer.id === cheapestOfferId"
                class="absolute -top-2 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {{ t('results.cheapestBadge') }}
              </div>
              <FlightCard :offer="offer" @select="selectOffer(offer)" />
            </div>

            <!-- Load more -->
            <div v-if="hasMore" class="text-center py-4">
              <button @click="loadMore"
                class="px-8 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 rounded-xl font-semibold transition-colors">
                {{ t('results.showMore') }} ({{ offersStore.filtered.length - visibleCount }} {{ t('results.remaining') }})
              </button>
            </div>

            <!-- Nearby dates suggestion -->
            <div v-if="offersStore.filtered.length > 0" class="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p class="text-xs text-blue-700 font-medium mb-2 flex items-center justify-center gap-1">
                <svg aria-hidden="true" class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-3.5 13.06V17a1 1 0 001 1h5a1 1 0 001-1v-1.94A7 7 0 0012 2zm1 14h-2v-1h2v1zm0-3h-2V9h2v4z"/></svg>
                {{ t('results.dateTip') }}
              </p>
              <div class="flex gap-2 justify-center flex-wrap">
                <span class="text-[10px] bg-white border border-blue-200 rounded-full px-3 py-1 text-blue-600">{{ t('results.dateTipTuesday') }}</span>
                <span class="text-[10px] bg-white border border-blue-200 rounded-full px-3 py-1 text-blue-600">{{ t('results.dateTipAvoid') }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-overlay-enter-active, .filter-overlay-leave-active { transition: opacity 0.25s ease; }
.filter-overlay-enter-from, .filter-overlay-leave-to { opacity: 0; }
.filter-panel-enter-active, .filter-panel-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.filter-panel-enter-from, .filter-panel-leave-to { transform: translateX(100%); }
</style>
