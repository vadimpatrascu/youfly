<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
import { useOffersStore } from '~/stores/offers'
import { useBookingStore } from '~/stores/booking'

useHead({ title: 'Flight Results — YouFly' })

const searchStore = useSearchStore()
const offersStore = useOffersStore()
const bookingStore = useBookingStore()
const router = useRouter()

onMounted(async () => {
  if (!searchStore.offerRequestId) {
    return router.push('/')
  }
  await offersStore.loadOffers(searchStore.offerRequestId)
})

function selectOffer(offer: any) {
  bookingStore.selectOffer(offer)
  router.push('/ticket-order')
}

const { formatPrice } = useFormatters()
const showFilters = ref(false)
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ searchStore.origin?.city_name }} → {{ searchStore.destination?.city_name }}
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          {{ offersStore.filtered.length }} flights found
          <span v-if="searchStore.departureDate">· {{ searchStore.departureDate }}</span>
          · {{ searchStore.adults + searchStore.children + searchStore.infants }} passenger{{ searchStore.adults + searchStore.children + searchStore.infants > 1 ? 's' : '' }}
        </p>
      </div>
      <div class="flex gap-2">
        <button @click="router.push('/')" class="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">← Modify</button>
        <button @click="showFilters = !showFilters" class="md:hidden px-4 py-2 text-sm bg-brand-600 text-white rounded-xl">Filters</button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Sidebar -->
      <div class="hidden md:block w-64 shrink-0">
        <FilterSidebar />
      </div>
      <!-- Mobile filter overlay -->
      <div v-if="showFilters" class="fixed inset-0 z-50 md:hidden bg-black/50" @click="showFilters = false">
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-gray-50 p-4 overflow-y-auto" @click.stop>
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Filters</h3>
            <button @click="showFilters = false" class="text-gray-500">✕</button>
          </div>
          <FilterSidebar />
        </div>
      </div>

      <!-- Results -->
      <div class="flex-1 space-y-4">
        <!-- Loading -->
        <template v-if="offersStore.isLoading">
          <FlightCardSkeleton v-for="i in 5" :key="i" />
        </template>

        <!-- Error -->
        <div v-else-if="offersStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p class="text-red-600 font-medium">{{ offersStore.error }}</p>
          <button @click="router.push('/')" class="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl text-sm">Search again</button>
        </div>

        <!-- Empty -->
        <div v-else-if="!offersStore.filtered.length && !offersStore.isLoading" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="font-semibold text-gray-900 mb-2">No flights found</h3>
          <p class="text-gray-500 text-sm mb-4">Try adjusting your filters or search for different dates.</p>
          <button @click="offersStore.clearFilters()" class="px-6 py-2 border border-brand-600 text-brand-600 rounded-xl text-sm hover:bg-brand-50">Clear filters</button>
        </div>

        <!-- Offers -->
        <template v-else>
          <FlightCard
            v-for="offer in offersStore.filtered"
            :key="offer.id"
            :offer="offer"
            @select="selectOffer(offer)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
