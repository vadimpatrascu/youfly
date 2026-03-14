<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()
const router = useRouter()
const { success, error } = useToast()

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
  if (ok) {
    router.push('/search')
  } else if (searchStore.searchError) {
    error(searchStore.searchError)
  }
}

const today = new Date().toISOString().split('T')[0]

function addDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function nextWeekday(day: number) { // 0=Sun, 5=Fri, 6=Sat
  const d = new Date()
  const diff = (day - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

const quickDates = computed(() => [
  { label: t('search.today'), value: today },
  { label: t('search.tomorrow'), value: addDays(1) },
  { label: t('search.friday'), value: nextWeekday(5) },
  { label: t('search.weekend'), value: nextWeekday(6) },
])

const canSearch = computed(() =>
  searchStore.origin &&
  searchStore.destination &&
  searchStore.departureDate &&
  (searchStore.origin.airport_iata || searchStore.origin.iata_code) !==
  (searchStore.destination.airport_iata || searchStore.destination.iata_code)
)

const sameAirportError = computed(() =>
  searchStore.origin && searchStore.destination &&
  (searchStore.origin.airport_iata || searchStore.origin.iata_code) ===
  (searchStore.destination.airport_iata || searchStore.destination.iata_code)
)


const totalPassengers = computed(() => searchStore.adults + searchStore.children + searchStore.infants)
const passengersLabel = computed(() => {
  const n = totalPassengers.value
  const cabinLabel = cabinOptions.value.find(o => o.value === searchStore.cabinClass)?.label || searchStore.cabinClass
  return `${n} ${n === 1 ? t('search.passenger') : t('search.passengers_plural')} · ${cabinLabel}`
})

const cabinOptions = computed(() => [
  { value: 'economy', label: t('search.economy') },
  { value: 'premium_economy', label: t('search.premiumEconomy') },
  { value: 'business', label: t('search.business') },
  { value: 'first', label: t('search.first') },
])
</script>

<template>
  <div role="search" :aria-label="t('search.formLabel')" class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto">
    <!-- Trip type -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="type in [{ v: 'oneway', label: t('search.oneWay') }, { v: 'return', label: t('search.return') }]"
        :key="type.v"
        @click="tripType = type.v as any"
        :aria-pressed="tripType === type.v"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
        :class="tripType === type.v ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >{{ type.label }}</button>
    </div>

    <!-- Airport row -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 mb-4 items-end">
      <AirportInput v-model="searchStore.origin" :label="t('search.from')" :placeholder="t('search.fromPlaceholder')" />
      <button @click="swapAirports" :aria-label="t('search.swap')" class="mb-1 p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-lg self-end border border-gray-200">
        <span aria-hidden="true">⇄</span>
      </button>
      <AirportInput v-model="searchStore.destination" :label="t('search.to')" :placeholder="t('search.toPlaceholder')" />
    </div>

    <!-- Dates + passengers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <div>
        <label for="search-departure" class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.departure') }}</label>
        <input id="search-departure" type="date" v-model="searchStore.departureDate" :min="today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" />
        <div class="flex gap-1.5 mt-1.5 flex-wrap">
          <button v-for="qd in quickDates" :key="qd.label"
            @click="searchStore.departureDate = qd.value"
            type="button"
            :aria-pressed="searchStore.departureDate === qd.value"
            class="px-2.5 py-1 text-xs rounded-full border transition-colors"
            :class="searchStore.departureDate === qd.value ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'">
            {{ qd.label }}
          </button>
        </div>
      </div>
      <div v-if="tripType === 'return'">
        <label for="search-return" class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.returnDate') }}</label>
        <input id="search-return" type="date" v-model="searchStore.returnDate" :min="searchStore.departureDate || today"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900" />
      </div>
      <div :class="tripType === 'return' ? 'md:col-span-1' : 'md:col-span-2'">
        <label id="passengers-label" class="block text-sm font-medium text-gray-700 mb-1">{{ t('search.passengers') }}</label>
        <div class="relative" ref="passengerDropdownRef">
          <button @click="showPassengers = !showPassengers"
            aria-labelledby="passengers-label"
            :aria-expanded="showPassengers" aria-haspopup="true"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl text-left text-gray-900 hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors">
            {{ passengersLabel }}
          </button>
          <div v-if="showPassengers" class="absolute z-50 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <div v-for="p in [
              { key: 'adults', label: t('search.adults'), sub: t('search.adultsAge'), min: 1, max: 9 },
              { key: 'children', label: t('search.children'), sub: t('search.childrenAge'), min: 0, max: 9 },
              { key: 'infants', label: t('search.infants'), sub: t('search.infantsAge'), min: 0, max: 4 }
            ]" :key="p.key" class="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ p.label }}</div>
                <div class="text-xs text-gray-500">{{ p.sub }}</div>
              </div>
              <div class="flex items-center gap-3">
                <button @click="(searchStore as any)[p.key] = Math.max(p.min, (searchStore as any)[p.key] - 1)"
                  :disabled="(searchStore as any)[p.key] <= p.min"
                  :aria-label="t('search.decrease') + ' ' + p.label"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold"><span aria-hidden="true">−</span></button>
                <span class="w-6 text-center text-sm font-semibold" aria-live="polite">{{ (searchStore as any)[p.key] }}</span>
                <button @click="(searchStore as any)[p.key] = Math.min(p.max, (searchStore as any)[p.key] + 1)"
                  :disabled="(searchStore as any)[p.key] >= p.max"
                  :aria-label="t('search.increase') + ' ' + p.label"
                  class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold"><span aria-hidden="true">+</span></button>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t">
              <label for="search-cabin-class" class="text-sm font-medium text-gray-700 block mb-2">{{ t('search.cabinClass') }}</label>
              <select id="search-cabin-class" v-model="searchStore.cabinClass" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option v-for="opt in cabinOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <button @click="showPassengers = false" class="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors">{{ t('search.done') }}</button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="sameAirportError" role="alert" class="text-orange-600 text-sm mb-4 bg-orange-50 p-3 rounded-xl"><span aria-hidden="true">&#9888;</span> {{ t('common.sameAirportError') }}</p>
    <p v-if="searchStore.searchError" role="alert" class="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-xl">{{ searchStore.searchError }}</p>

    <button @click="onSubmit"
      :disabled="searchStore.isSearching || !canSearch"
      class="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
      <span v-if="searchStore.isSearching" class="flex items-center justify-center gap-2">
        <div role="status" :aria-label="t('common.loading')" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {{ t('search.searching') }}
      </span>
      <span v-else><span aria-hidden="true">🔍</span> {{ t('search.searchButton') }}</span>
    </button>
    <LoadingOverlay v-if="searchStore.isSearching" />
  </div>
</template>
