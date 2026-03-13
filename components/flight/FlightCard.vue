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

function shortDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ro-MD', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all p-4 md:p-6 cursor-pointer group" @click="emit('select')">
    <div v-for="(slice, i) in offer.slices" :key="slice.id || i" :class="i > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''">
      <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
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
            @error="($event.target as HTMLImageElement).style.display='none'"
          />
          <div v-else class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-400">✈</div>
        </div>

        <!-- Flight info -->
        <div class="flex-1 grid grid-cols-3 items-center gap-2">
          <!-- Departure -->
          <div>
            <div class="text-xl md:text-2xl font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
            <div class="text-sm font-semibold text-gray-700">{{ slice.origin?.iata_code }}</div>
            <div class="text-xs text-gray-400">{{ shortDate(slice.departing_at) }}</div>
          </div>

          <!-- Duration + stops -->
          <div class="text-center">
            <div class="text-xs text-gray-500 mb-1.5">{{ formatDuration(slice.duration_minutes) }}</div>
            <div class="relative flex items-center">
              <div class="flex-1 h-px bg-gray-300"></div>
              <span class="text-gray-400 text-xs mx-1">✈</span>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>
            <div class="text-xs mt-1.5 font-semibold" :class="slice.stops === 0 ? 'text-green-600' : 'text-orange-500'">
              {{ stopsLabel(slice.stops) }}
            </div>
          </div>

          <!-- Arrival -->
          <div class="text-right">
            <div class="text-xl md:text-2xl font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
            <div class="text-sm font-semibold text-gray-700">{{ slice.destination?.iata_code }}</div>
            <div class="text-xs text-gray-400">{{ shortDate(slice.arriving_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Carrier info -->
      <div class="mt-2 ml-[52px] flex items-center gap-2 text-xs text-gray-400 flex-wrap">
        <span v-if="slice.segments?.[0]?.carrier_name" class="font-medium text-gray-500">{{ slice.segments[0].carrier_name }}</span>
        <span class="font-mono">{{ slice.segments?.map((s: any) => s.flight_number).filter(Boolean).join(' · ') }}</span>
      </div>
    </div>

    <!-- Price + CTA -->
    <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div>
        <div class="text-2xl font-bold text-brand-600">{{ formatPrice(offer.total_amount, offer.total_currency) }}</div>
        <div class="text-xs text-gray-400">{{ t('flightCard.perPerson') }}</div>
      </div>
      <button
        @click.stop="emit('select')"
        class="px-6 py-3 bg-brand-600 hover:bg-brand-700 group-hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        {{ t('flightCard.select') }}
      </button>
    </div>
  </div>
</template>
