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
  // Offers are already in store from the search POST (return_offers: true)
  // loadOffers is a no-op if offers already loaded
  if (offersStore.all.length === 0) {
    await offersStore.loadOffers(searchStore.offerRequestId)
  }
})

function selectOffer(offer: any) {
  bookingStore.selectOffer(offer)
  router.push('/ticket-order')
}

const showFilters = ref(false)

const { formatPrice } = useFormatters()

const totalPassengers = computed(() => searchStore.adults + searchStore.children + searchStore.infants)
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ searchStore.origin?.city_name || '?' }} → {{ searchStore.destination?.city_name || '?' }}
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          <span v-if="!offersStore.isLoading">{{ offersStore.filtered.length }} {{ t('results.flightsFound') }}</span>
          <span v-else>{{ t('results.loading') }}</span>
          <span v-if="searchStore.departureDate"> · {{ searchStore.departureDate }}</span>
          <span> · {{ totalPassengers }} {{ totalPassengers === 1 ? t('search.passenger') : t('search.passengers_plural') }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="router.push('/')" class="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">{{ t('results.modify') }}</button>
        <button @click="showFilters = !showFilters" class="md:hidden px-4 py-2 text-sm bg-brand-600 text-white rounded-xl">{{ t('results.filters') }}</button>
      </div>
    </div>

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

      <div class="flex-1 space-y-4 min-w-0">
        <template v-if="offersStore.isLoading">
          <FlightCardSkeleton v-for="i in 6" :key="i" />
        </template>

        <div v-else-if="offersStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div class="text-4xl mb-3">😕</div>
          <p class="text-red-600 font-medium mb-4">{{ offersStore.error }}</p>
          <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl text-sm">{{ t('results.modify') }}</button>
        </div>

        <div v-else-if="!offersStore.filtered.length" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ t('results.noFlights') }}</h3>
          <p class="text-gray-500 text-sm mb-4">{{ t('results.noFlightsDesc') }}</p>
          <button @click="offersStore.clearFilters()" class="px-6 py-2 border border-brand-600 text-brand-600 rounded-xl text-sm hover:bg-brand-50">{{ t('results.clearFilters') }}</button>
        </div>

        <template v-else>
          <FlightCard v-for="offer in offersStore.filtered" :key="offer.id" :offer="offer" @select="selectOffer(offer)" />
        </template>
      </div>
    </div>
  </div>
</template>
