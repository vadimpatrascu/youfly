<script setup lang="ts">
import { useOffersStore } from '~/stores/offers'
const props = defineProps<{ dark?: boolean }>()
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

function toggleTimeSlot(val: string) {
  const idx = store.filters.timeSlots.indexOf(val)
  if (idx === -1) store.filters.timeSlots.push(val)
  else store.filters.timeSlots.splice(idx, 1)
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
  <div role="region" :aria-label="t('filters.title')"
    :class="dark ? 'space-y-5' : 'bg-white rounded-2xl border border-gray-200 p-5 space-y-5'">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold" :class="dark ? 'text-white' : 'text-gray-900'">{{ t('filters.title') }}</h3>
      <button @click="store.clearFilters(); localMax = priceRange.max" class="text-xs text-brand-400 hover:underline">{{ t('filters.clearAll') }}</button>
    </div>

    <!-- Sort -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.sortBy') }}</h4>
      <div class="flex flex-col gap-1">
        <button v-for="s in [{ v: 'price', l: t('filters.cheapest') }, { v: 'duration', l: t('filters.fastest') }, { v: 'departure', l: t('filters.earliest') }]"
          :key="s.v"
          @click="store.sortBy = s.v as any; store.applyFilters()"
          :aria-pressed="store.sortBy === s.v"
          class="text-left px-3 py-2 rounded-lg text-sm transition-colors"
          :class="store.sortBy === s.v
            ? (dark ? 'bg-brand-600/20 text-brand-300 font-semibold' : 'bg-brand-100 text-brand-700 font-semibold')
            : (dark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50')"
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
          <span class="text-sm group-hover:text-white">{{ s.l }}</span>
        </label>
      </div>
    </div>

    <!-- Price with histogram -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {{ t('filters.maxPrice') }}: <span class="text-brand-600 font-bold">{{ localMax >= priceRange.max ? t('filters.any') : `€${localMax}` }}</span>
      </h4>
      <!-- Histogram bars -->
      <div v-if="histogram.length" aria-hidden="true" class="flex items-end gap-0.5 h-12 mb-2">
        <div v-for="(bar, i) in histogram" :key="i"
          class="flex-1 rounded-t transition-colors"
          :style="`height: ${bar.height}px`"
          :class="bar.active ? 'bg-brand-400' : 'bg-gray-200'"
        ></div>
      </div>
      <input type="range" :min="priceRange.min" :max="priceRange.max" :value="localMax" @input="updatePrice"
        :aria-label="t('filters.maxPrice')" :aria-valuetext="`€${localMax}`" class="w-full accent-brand-600" />
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
        @input="updateDuration" :aria-label="t('filters.duration')"
        :aria-valuetext="store.filters.maxDuration ? store.filters.maxDuration + 'h' : t('filters.any')"
        class="w-full accent-brand-600" />
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>1h</span>
        <span>{{ maxDurationAvailable }}h</span>
      </div>
    </div>

    <!-- Departure time -->
    <div>
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.departureTime') }}</h4>
      <div class="grid grid-cols-2 gap-1.5">
        <button v-for="slot in [
          { v: 'morning', l: t('filters.morning'), sub: t('filters.morningHours'), svgPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-orange-400' },
          { v: 'afternoon', l: t('filters.afternoon'), sub: t('filters.afternoonHours'), svgPath: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-yellow-500' },
          { v: 'evening', l: t('filters.evening'), sub: t('filters.eveningHours'), svgPath: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', color: 'text-orange-500' },
          { v: 'night', l: t('filters.night'), sub: t('filters.nightHours'), svgPath: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', color: 'text-indigo-400' },
        ]" :key="slot.v"
          @click="toggleTimeSlot(slot.v)"
          :aria-pressed="store.filters.timeSlots.includes(slot.v)"
          class="flex flex-col items-center py-2 px-1 rounded-xl border text-xs transition-colors"
          :class="store.filters.timeSlots.includes(slot.v)
            ? (dark ? 'bg-brand-600/20 border-brand-500 text-brand-300 font-semibold' : 'bg-brand-50 border-brand-400 text-brand-700 font-semibold')
            : (dark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-600 hover:border-gray-300')">
          <svg aria-hidden="true" :class="['w-4 h-4 mb-0.5', slot.color]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="slot.svgPath"/></svg>
          <span>{{ slot.l }}</span>
          <span class="text-gray-400 text-[10px]">{{ slot.sub }}</span>
        </button>
      </div>
    </div>

    <!-- Airlines -->
    <div v-if="store.uniqueAirlinesWithCode.length">
      <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{ t('filters.airlines') }}</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
        <label v-for="a in store.uniqueAirlinesWithCode" :key="a.name" class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" :checked="store.filters.airlines.includes(a.name)" @change="toggleAirline(a.name)"
            class="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
          <img v-if="a.iata" :src="`https://www.gstatic.com/flights/airline_logos/70px/${a.iata}.png`"
            :alt="a.name" class="w-5 h-5 object-contain shrink-0" @error="($event.target as HTMLElement).style.display='none'" />
          <span class="text-sm group-hover:text-white truncate">{{ a.name }}</span>
        </label>
      </div>
    </div>

    <!-- Active filters count -->
    <div v-if="store.filters.stops.length || store.filters.airlines.length || store.filters.maxPrice || store.filters.timeSlots.length || store.filters.maxDuration"
      aria-live="polite" aria-atomic="true"
      :class="dark ? 'bg-brand-600/10 border border-brand-600/20 rounded-xl p-3 text-xs text-brand-300 text-center' : 'bg-brand-50 border border-brand-100 rounded-xl p-3 text-xs text-brand-700 text-center'">
      {{ (store.filters.stops.length + store.filters.airlines.length + (store.filters.maxPrice ? 1 : 0) + (store.filters.timeSlots.length ? 1 : 0) + (store.filters.maxDuration ? 1 : 0)) }} {{ t('filters.activeFilters') }}
      <button @click="store.clearFilters(); localMax = priceRange.max" class="ml-2 underline">{{ t('filters.deleteFilters') }}</button>
    </div>
  </div>
</template>
