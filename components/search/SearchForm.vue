<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()

const tripType = computed({
  get: () => searchStore.tripType,
  set: (v) => { searchStore.tripType = v }
})

const showPassengers = ref(false)
const passengerDropdownRef = ref<HTMLElement>()

onClickOutside(passengerDropdownRef, () => { showPassengers.value = false })

function swapAirports() {
  const tmp = searchStore.origin
  searchStore.origin = searchStore.destination
  searchStore.destination = tmp
}

async function onSubmit() {
  const ok = await searchStore.submitSearch()
  if (ok) router.push('/search')
}

const today = new Date().toISOString().split('T')[0]

const totalPassengers = computed(() => searchStore.adults + searchStore.children + searchStore.infants)
const passengersLabel = computed(() => {
  const n = totalPassengers.value
  return `${n} ${n === 1 ? t('search.passenger') : t('search.passengers_plural')} · ${searchStore.cabinClass}`
})

const cabinOptions = computed(() => [
  { value: 'economy', label: t('search.economy') },
  { value: 'premium_economy', label: t('search.premiumEconomy') },
  { value: 'business', label: t('search.business') },
  { value: 'first', label: t('search.first') },
])
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto">
    <!-- Trip type -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="type in [{ v: 'oneway', label: t('search.oneWay') }, { v: 'return', label: t('search.return') }]"
        :key="type.v"
        @click="tripType = type.v as any"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="tripType === type.v ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >{{ type.label }}</button>
    </div>

    <!-- Airport row -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 mb-4 items-end">
      <AirportInput v-model="searchStore.origin" :label="t('search.from')" :placeholder="t('search.fromPlaceholder')" />
      <button @click="swapAirports" class="mb-1 p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-lg self-end border border-gray-200" title="Swap">
        ⇄
      </button>
      <AirportInput v-model="searchStore.destination" :label="t('search.to')" :placeholder="t('search.toPlaceholder')" />
    </div>

    <!-- Dates + passengers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.departure') }}</label>
        <input type="date" v-model="searchStore.departureDate" :min="today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" />
      </div>
      <div v-if="tripType === 'return'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.returnDate') }}</label>
        <input type="date" v-model="searchStore.returnDate" :min="searchStore.departureDate || today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" />
      </div>
      <div :class="tripType === 'return' ? 'md:col-span-1' : 'md:col-span-2'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.passengers') }}</label>
        <div class="relative" ref="passengerDropdownRef">
          <button @click="showPassengers = !showPassengers"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl text-left text-gray-900 hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors">
            {{ passengersLabel }}
          </button>
          <div v-if="showPassengers" class="absolute z-50 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <div v-for="p in [
              { key: 'adults', label: t('search.adults'), sub: t('search.adultsAge'), min: 1 },
              { key: 'children', label: t('search.children'), sub: t('search.childrenAge'), min: 0 },
              { key: 'infants', label: t('search.infants'), sub: t('search.infantsAge'), min: 0 }
            ]" :key="p.key" class="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ p.label }}</div>
                <div class="text-xs text-gray-500">{{ p.sub }}</div>
              </div>
              <div class="flex items-center gap-3">
                <button @click="(searchStore as any)[p.key] = Math.max(p.min, (searchStore as any)[p.key] - 1)"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold">−</button>
                <span class="w-6 text-center text-sm font-semibold">{{ (searchStore as any)[p.key] }}</span>
                <button @click="(searchStore as any)[p.key]++"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold">+</button>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t">
              <label class="text-sm font-medium text-gray-700 block mb-2">{{ t('search.cabinClass') }}</label>
              <select v-model="searchStore.cabinClass" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option v-for="opt in cabinOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <button @click="showPassengers = false" class="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors">{{ t('search.done') }}</button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="searchStore.searchError" class="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-xl">{{ searchStore.searchError }}</p>

    <button @click="onSubmit"
      :disabled="searchStore.isSearching || !searchStore.origin || !searchStore.destination || !searchStore.departureDate"
      class="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
      <span v-if="searchStore.isSearching" class="flex items-center justify-center gap-2">
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ t('search.searching') }}
      </span>
      <span v-else>🔍 {{ t('search.searchButton') }}</span>
    </button>
  </div>
</template>
