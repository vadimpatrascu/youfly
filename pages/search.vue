<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useOffersStore } from '~/stores/offers'
import { useBookingStore } from '~/stores/booking'

const { t } = useI18n()
useHead({ title: computed(() => `${t('results.title')} — YouFly`) })

const searchStore = useSearchStore()
const offersStore = useOffersStore()
const bookingStore = useBookingStore()
const router = useRouter()

onMounted(async () => {
  if (!searchStore.offerRequestId) return router.push('/')
  if (offersStore.all.length === 0) {
    await offersStore.loadOffers(searchStore.offerRequestId)
  }
})

function selectOffer(offer: any) {
  bookingStore.selectOffer(offer)
  router.push('/ticket-order')
}

const showFilters = ref(false)
const showModifySearch = ref(false)

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
    <div class="bg-white border-b border-gray-200 py-3 px-4 shadow-sm">
      <div class="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        <button @click="showModifySearch = !showModifySearch"
          class="flex-1 min-w-0 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-left transition-colors">
          <span class="text-brand-600 shrink-0">🔍</span>
          <div class="min-w-0">
            <div class="font-semibold text-gray-900 text-sm truncate">
              {{ searchStore.origin?.city_name || '?' }} → {{ searchStore.destination?.city_name || '?' }}
            </div>
            <div class="text-xs text-gray-500 truncate">
              {{ searchStore.departureDate }}
              <span v-if="searchStore.tripType === 'return' && searchStore.returnDate"> · {{ searchStore.returnDate }}</span>
              · {{ totalPassengers }} {{ totalPassengers === 1 ? t('search.passenger') : t('search.passengers_plural') }}
              · {{ searchStore.cabinClass }}
            </div>
          </div>
          <span class="text-gray-400 text-xs ml-auto shrink-0">{{ t('results.modify') }}</span>
        </button>
        <button @click="showFilters = !showFilters" class="md:hidden px-4 py-2.5 text-sm bg-brand-600 text-white rounded-xl shrink-0 flex items-center gap-1.5">
          {{ t('results.filters') }}
          <span v-if="offersStore.filters.stops.length + offersStore.filters.airlines.length + (offersStore.filters.maxPrice ? 1 : 0) + (offersStore.filters.maxDuration ? 1 : 0) + offersStore.filters.timeSlots.length > 0"
            class="bg-white text-brand-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {{ offersStore.filters.stops.length + offersStore.filters.airlines.length + (offersStore.filters.maxPrice ? 1 : 0) + (offersStore.filters.maxDuration ? 1 : 0) + offersStore.filters.timeSlots.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- Expandable search modification -->
    <div v-if="showModifySearch" class="bg-brand-700 py-6 px-4">
      <div class="max-w-6xl mx-auto">
        <SearchForm />
      </div>
    </div>

    <!-- Price guarantee strip -->
    <div v-if="!offersStore.isLoading && offersStore.filtered.length > 0"
      class="bg-green-50 border-b border-green-100 py-2 px-4 text-center text-xs text-green-700 font-medium">
      ✓ Prețuri în timp real de la companiile aeriene · Fără taxe ascunse · Rezervare instantă
    </div>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p class="text-sm text-gray-500">
          <span v-if="!offersStore.isLoading" class="font-semibold text-gray-800">{{ offersStore.filtered.length }}</span>
          <span v-if="!offersStore.isLoading"> {{ t('results.flightsFound') }}</span>
          <span v-else>{{ t('results.loading') }}</span>
        </p>
        <div v-if="!offersStore.isLoading && offersStore.filtered.length > 0" class="text-xs text-gray-400">
          De la <span class="font-semibold text-gray-700">{{ formatPrice(offersStore.priceRange.min.toString(), offersStore.filtered[0]?.total_currency || 'EUR') }}</span>
          la <span class="font-semibold text-gray-700">{{ formatPrice(offersStore.priceRange.max.toString(), offersStore.filtered[0]?.total_currency || 'EUR') }}</span>
        </div>
      </div>

      <!-- Price alert banner -->
      <PriceAlertBanner v-if="!offersStore.isLoading && offersStore.filtered.length > 0" class="mb-4" />

      <!-- Quick sort pills -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button v-for="s in [
          { v: 'price', l: t('filters.cheapest') },
          { v: 'duration', l: t('filters.fastest') },
          { v: 'departure', l: t('filters.earliest') }
        ]" :key="s.v"
          @click="offersStore.sortBy = s.v as any; offersStore.applyFilters()"
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
          <div v-if="showFilters" class="fixed inset-0 z-50 md:hidden bg-black/50" @click="showFilters = false">
            <div class="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 p-4 overflow-y-auto" @click.stop>
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-semibold">{{ t('filters.title') }}</h3>
                <button @click="showFilters = false" class="text-gray-500 text-xl">✕</button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        </Teleport>

        <div class="flex-1 space-y-3 min-w-0">
          <template v-if="offersStore.isLoading">
            <FlightCardSkeleton v-for="i in 6" :key="i" />
          </template>

          <div v-else-if="offersStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div class="text-4xl mb-3">😕</div>
            <p class="text-red-600 font-medium mb-4">{{ offersStore.error }}</p>
            <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm">{{ t('results.modify') }}</button>
          </div>

          <div v-else-if="!offersStore.filtered.length" class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div class="text-5xl mb-4">🔍</div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ t('results.noFlights') }}</h3>
            <p class="text-gray-500 text-sm mb-4">{{ t('results.noFlightsDesc') }}</p>
            <div class="flex gap-3 justify-center flex-wrap">
              <button @click="offersStore.clearFilters()" class="px-6 py-2 border border-brand-600 text-brand-600 rounded-xl text-sm hover:bg-brand-50 transition-colors">{{ t('results.clearFilters') }}</button>
              <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm hover:bg-brand-700 transition-colors">{{ t('results.modify') }}</button>
            </div>
            <p v-if="offersStore.all.length > 0" class="text-xs text-gray-400 mt-4">
              {{ offersStore.all.length }} zboruri disponibile — încearcă să ajustezi filtrele
            </p>
          </div>

          <template v-else>
            <div v-for="offer in visibleOffers" :key="offer.id" class="relative">
              <div v-if="offer.id === cheapestOfferId"
                class="absolute -top-2 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                🏷 Cel mai ieftin
              </div>
              <FlightCard :offer="offer" @select="selectOffer(offer)" />
            </div>

            <!-- Load more -->
            <div v-if="hasMore" class="text-center py-4">
              <button @click="loadMore"
                class="px-8 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 rounded-xl font-semibold transition-colors">
                Arată mai multe ({{ offersStore.filtered.length - visibleCount }} rămase)
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
