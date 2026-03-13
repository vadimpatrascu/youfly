<script setup lang="ts">
import { useOffersStore } from '~/stores/offers'
const { t } = useI18n()
const store = useOffersStore()
const priceRange = computed(() => store.priceRange)
const localMax = ref<number>(9999)

watch(() => priceRange.value.max, (v) => { localMax.value = v }, { immediate: true })

function updatePrice(e: Event) {
  localMax.value = parseInt((e.target as HTMLInputElement).value)
  store.filters.maxPrice = localMax.value >= priceRange.value.max ? null : localMax.value
  store.applyFilters()
}

function toggleStop(val: string) {
  const idx = store.filters.stops.indexOf(val)
  if (idx === -1) store.filters.stops.push(val)
  else store.filters.stops.splice(idx, 1)
  store.applyFilters()
}

function toggleAirline(val: string) {
  const idx = store.filters.airlines.indexOf(val)
  if (idx === -1) store.filters.airlines.push(val)
  else store.filters.airlines.splice(idx, 1)
  store.applyFilters()
}

const maxDurationAvailable = computed(() => {
  if (!store.all.length) return 24
  const max = Math.max(...store.all.map(o =>
    o.slices.reduce((s: number, sl: any) => s + (sl.duration_minutes || 0), 0) / 60
  ))
  return Math.ceil(max)
})

function updateDuration(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  store.filters.maxDuration = val >= maxDurationAvailable.value ? null : val
  store.applyFilters()
}

// Price histogram: 8 buckets
const histogram = computed(() => {
  const all = store.all
  if (!all.length) return []
  const min = priceRange.value.min
  const max = priceRange.value.max
  const buckets = 8
  const step = (max - min) / buckets
  const counts = Array(buckets).fill(0)
  all.forEach(o => {
    const price = parseFloat(o.total_amount)
    const idx = Math.min(buckets - 1, Math.floor((price - min) / step))
    counts[idx]++
  })
  const maxCount = Math.max(...counts, 1)
  return counts.map((c, i) => ({
    height: Math.max(4, Math.round((c / maxCount) * 48)),
    active: localMax.value >= min + (i + 1) * step,
    count: c,
  }))
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-900">{{ t('filters.title') }}</h3>
      <button @click="store.clearFilters(); localMax = priceRange.max" class="text-xs text-brand-600 hover:underline">{{ t('filters.clearAll') }}</button>
    </div>

    <!-- Sort -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.sortBy') }}</h4>
      <div class="flex flex-col gap-1">
        <button v-for="s in [{ v: 'price', l: t('filters.cheapest') }, { v: 'duration', l: t('filters.fastest') }, { v: 'departure', l: t('filters.earliest') }]"
          :key="s.v"
          @click="store.sortBy = s.v as any; store.applyFilters()"
          class="text-left px-3 py-2 rounded-lg text-sm transition-colors"
          :class="store.sortBy === s.v ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'"
        >{{ s.l }}</button>
      </div>
    </div>

    <!-- Stops -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.stops') }}</h4>
      <div class="space-y-2">
        <label v-for="s in [{ v: 'direct', l: t('filters.direct') }, { v: '1stop', l: t('filters.oneStop') }, { v: '2plus', l: t('filters.twoPlus') }]"
          :key="s.v" class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" :checked="store.filters.stops.includes(s.v)" @change="toggleStop(s.v)"
            class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ s.l }}</span>
        </label>
      </div>
    </div>

    <!-- Price with histogram -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {{ t('filters.maxPrice') }}: <span class="text-brand-600 font-bold">{{ localMax >= priceRange.max ? t('filters.any') : `€${localMax}` }}</span>
      </h4>
      <!-- Histogram bars -->
      <div v-if="histogram.length" class="flex items-end gap-0.5 h-12 mb-2">
        <div v-for="(bar, i) in histogram" :key="i"
          class="flex-1 rounded-t transition-colors"
          :style="`height: ${bar.height}px`"
          :class="bar.active ? 'bg-brand-400' : 'bg-gray-200'"
        ></div>
      </div>
      <input type="range" :min="priceRange.min" :max="priceRange.max" :value="localMax" @input="updatePrice" class="w-full accent-brand-600" />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>€{{ priceRange.min }}</span>
        <span>€{{ priceRange.max }}</span>
      </div>
    </div>

    <!-- Max duration -->
    <div v-if="store.all.length">
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {{ t('filters.duration') }}: <span class="text-brand-600 font-bold">{{ store.filters.maxDuration ? store.filters.maxDuration + 'h' : t('filters.any') }}</span>
      </h4>
      <input type="range" min="1" :max="maxDurationAvailable" :value="store.filters.maxDuration || maxDurationAvailable"
        @input="updateDuration" class="w-full accent-brand-600" />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>1h</span>
        <span>{{ maxDurationAvailable }}h</span>
      </div>
    </div>

    <!-- Airlines -->
    <div v-if="store.uniqueAirlines.length">
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.airlines') }}</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <label v-for="a in store.uniqueAirlinesWithCode" :key="a.name" class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" :checked="store.filters.airlines.includes(a.name)" @change="toggleAirline(a.name)"
            class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <img v-if="a.iata" :src="`https://assets.duffel.com/img/airlines/for-light-background/${a.iata}.svg`"
            class="w-5 h-5 object-contain shrink-0" @error="($event.target as HTMLElement).style.display='none'" />
          <span class="text-sm text-gray-700 group-hover:text-gray-900 truncate">{{ a.name }}</span>
        </label>
      </div>
    </div>

    <!-- Active filters count -->
    <div v-if="store.filters.stops.length || store.filters.airlines.length || store.filters.maxPrice"
      class="bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-700 text-center">
      {{ (store.filters.stops.length + store.filters.airlines.length + (store.filters.maxPrice ? 1 : 0)) }} filtru(e) activ(e)
      <button @click="store.clearFilters(); localMax = priceRange.max" class="ml-2 underline">Șterge</button>
    </div>
  </div>
</template>
