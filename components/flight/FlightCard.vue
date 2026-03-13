<script setup lang="ts">
import type { SimplifiedOffer } from '~/stores/offers'

const props = defineProps<{ offer: SimplifiedOffer }>()
const emit = defineEmits<{ select: [] }>()
const { t } = useI18n()
const { formatTime, formatDate, formatDuration, formatPrice } = useFormatters()

function airlineLogo(iata: string) {
  if (!iata) return ''
  return `https://assets.duffel.com/img/airlines/for-light-background/${iata}.svg`
}

function stopsLabel(stops: number) {
  if (stops === 0) return t('flightCard.direct')
  if (stops === 1) return `1 ${t('flightCard.stop')}`
  return `${stops} ${t('flightCard.stops')}`
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all p-4 md:p-6">
    <div v-for="(slice, i) in offer.slices" :key="slice.id || i" class="mb-4 last:mb-0">
      <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
      </div>
      <div class="flex items-center gap-3 md:gap-6">
        <!-- Airline logo -->
        <div class="shrink-0 w-10 h-10 flex items-center justify-center">
          <img
            v-if="slice.segments?.[0]?.carrier_iata"
            :src="airlineLogo(slice.segments[0].carrier_iata)"
            :alt="slice.segments[0].carrier_name"
            class="w-10 h-10 object-contain"
            @error="($event.target as HTMLImageElement).src = ''"
          />
          <div v-else class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-400">✈</div>
        </div>

        <!-- Flight info -->
        <div class="flex-1 grid grid-cols-3 items-center gap-2">
          <!-- Departure -->
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
            <div class="text-sm font-medium text-gray-600">{{ slice.origin?.iata_code }}</div>
            <div class="text-xs text-gray-400 truncate max-w-[80px]">{{ slice.origin?.city_name }}</div>
          </div>

          <!-- Duration + stops -->
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ formatDuration(slice.duration_minutes) }}</div>
            <div class="relative flex items-center">
              <div class="flex-1 h-px bg-gray-300"></div>
              <div class="w-2 h-2 rounded-full border-2 border-gray-400 bg-white mx-1 shrink-0"></div>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>
            <div class="text-xs mt-1 font-medium" :class="slice.stops === 0 ? 'text-green-600' : 'text-orange-500'">
              {{ stopsLabel(slice.stops) }}
            </div>
          </div>

          <!-- Arrival -->
          <div class="text-right">
            <div class="text-2xl font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
            <div class="text-sm font-medium text-gray-600">{{ slice.destination?.iata_code }}</div>
            <div class="text-xs text-gray-400 truncate max-w-[80px] ml-auto">{{ slice.destination?.city_name }}</div>
          </div>
        </div>
      </div>

      <!-- Carrier info -->
      <div class="mt-2 ml-[52px] text-xs text-gray-400">
        {{ slice.segments?.map((s: any) => s.flight_number).filter(Boolean).join(' · ') }}
        <span v-if="slice.segments?.[0]?.carrier_name"> · {{ slice.segments[0].carrier_name }}</span>
      </div>
    </div>

    <!-- Price + CTA -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div>
        <div class="text-2xl font-bold text-brand-600">{{ formatPrice(offer.total_amount, offer.total_currency) }}</div>
        <div class="text-xs text-gray-400">{{ t('flightCard.perPerson') }}</div>
      </div>
      <button
        @click="emit('select')"
        class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        {{ t('flightCard.select') }}
      </button>
    </div>
  </div>
</template>
