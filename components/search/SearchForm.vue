<script setup lang="ts">
import { useSearchStore } from '~/stores/search'

const searchStore = useSearchStore()
const router = useRouter()

const tripType = computed({
  get: () => searchStore.tripType,
  set: (v) => { searchStore.tripType = v }
})

const showPassengers = ref(false)

function swapAirports() {
  const tmp = searchStore.origin
  searchStore.origin = searchStore.destination
  searchStore.destination = tmp
}

async function onSubmit() {
  const ok = await searchStore.submitSearch()
  if (ok) router.push('/search')
}

// Today's date for min attribute
const today = new Date().toISOString().split('T')[0]
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto">
    <!-- Trip type tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="t in [{ v: 'oneway', label: 'One Way' }, { v: 'return', label: 'Return' }]"
        :key="t.v"
        @click="tripType = t.v as any"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="tripType === t.v ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Airport row -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 mb-4 items-end">
      <AirportInput
        v-model="searchStore.origin"
        label="From"
        placeholder="Origin city or airport"
      />
      <button @click="swapAirports" class="mb-1 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 self-end" title="Swap">
        ⇄
      </button>
      <AirportInput
        v-model="searchStore.destination"
        label="To"
        placeholder="Destination city or airport"
      />
    </div>

    <!-- Dates + passengers row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
        <input
          type="date"
          v-model="searchStore.departureDate"
          :min="today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900"
        />
      </div>
      <div v-if="tripType === 'return'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Return</label>
        <input
          type="date"
          v-model="searchStore.returnDate"
          :min="searchStore.departureDate || today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Passengers & Class</label>
        <div class="relative">
          <button
            @click="showPassengers = !showPassengers"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl text-left text-gray-900 hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
          >
            {{ searchStore.adults + searchStore.children + searchStore.infants }} passenger{{ searchStore.adults + searchStore.children + searchStore.infants !== 1 ? 's' : '' }} · {{ searchStore.cabinClass }}
          </button>
          <div v-if="showPassengers" class="absolute z-50 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <div v-for="p in [{ key: 'adults', label: 'Adults', sub: '12+ years' }, { key: 'children', label: 'Children', sub: '2–11 years' }, { key: 'infants', label: 'Infants', sub: 'Under 2 years' }]" :key="p.key" class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ p.label }}</div>
                <div class="text-xs text-gray-500">{{ p.sub }}</div>
              </div>
              <div class="flex items-center gap-3">
                <button @click="(searchStore as any)[p.key] = Math.max(p.key === 'adults' ? 1 : 0, (searchStore as any)[p.key] - 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700">-</button>
                <span class="w-5 text-center text-sm font-medium">{{ (searchStore as any)[p.key] }}</span>
                <button @click="(searchStore as any)[p.key]++" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700">+</button>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t">
              <label class="text-sm font-medium text-gray-700 block mb-2">Cabin Class</label>
              <select v-model="searchStore.cabinClass" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
            <button @click="showPassengers = false" class="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">Done</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <p v-if="searchStore.searchError" class="text-red-600 text-sm mb-4">{{ searchStore.searchError }}</p>

    <!-- Search button -->
    <button
      @click="onSubmit"
      :disabled="searchStore.isSearching || !searchStore.origin || !searchStore.destination || !searchStore.departureDate"
      class="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-lg transition-colors"
    >
      <span v-if="searchStore.isSearching" class="flex items-center justify-center gap-2">
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Searching...
      </span>
      <span v-else>🔍 Search Flights</span>
    </button>
  </div>
</template>
