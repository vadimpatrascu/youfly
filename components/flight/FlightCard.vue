<script setup lang="ts">
import type { SimplifiedOffer } from '~/stores/offers'
const props = defineProps<{ offer: SimplifiedOffer; highlighted?: boolean }>()
const emit = defineEmits<{ select: [] }>()
const { formatTime, formatDate, formatDuration, formatPrice, stopsLabel } = useFormatters()

function airlineLogo(iata: string) {
  return `https://assets.duffel.com/img/airlines/for-light-background/${iata}.svg`
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all p-4 md:p-6"
    :class="{ 'border-brand-400 shadow-md': highlighted }"
  >
    <div v-for="(slice, i) in offer.slices" :key="slice.id" class="mb-4 last:mb-0">
      <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {{ i === 0 ? 'Outbound' : 'Return' }}
      </div>
      <div class="flex items-center gap-4">
        <!-- Airline logo -->
        <img
          :src="airlineLogo(slice.segments?.[0]?.carrier_iata || 'XX')"
          :alt="slice.segments?.[0]?.carrier_name"
          class="w-10 h-10 object-contain shrink-0"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <!-- Times -->
        <div class="flex-1 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
            <div class="text-xs text-gray-500">{{ slice.origin.iata_code }}</div>
          </div>
          <div class="text-center px-2">
            <div class="text-xs text-gray-500 mb-1">{{ formatDuration(slice.duration_minutes) }}</div>
            <div class="flex items-center gap-1">
              <div class="flex-1 h-px bg-gray-300"></div>
              <div class="w-2 h-2 rounded-full border-2 border-gray-400"></div>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>
            <div class="text-xs mt-1" :class="slice.stops === 0 ? 'text-green-600 font-medium' : 'text-orange-500'">
              {{ stopsLabel(slice.stops) }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
            <div class="text-xs text-gray-500">{{ slice.destination.iata_code }}</div>
          </div>
        </div>
      </div>
      <div class="mt-2 text-xs text-gray-500 ml-14">
        {{ slice.segments?.map((s: any) => s.carrier_name).filter(Boolean).join(', ') }}
        · {{ formatDate(slice.departing_at) }}
      </div>
    </div>

    <!-- Price + button -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div>
        <div class="text-2xl font-bold text-brand-600">{{ formatPrice(offer.total_amount, offer.total_currency) }}</div>
        <div class="text-xs text-gray-500">per person incl. taxes</div>
      </div>
      <button
        @click="emit('select')"
        class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
      >
        Select →
      </button>
    </div>
  </div>
</template>
