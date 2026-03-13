<script setup lang="ts">
import type { SimplifiedOffer } from '~/stores/offers'

const props = defineProps<{ offer: SimplifiedOffer }>()
const emit = defineEmits<{ select: [] }>()
const { t } = useI18n()
const { formatTime, formatDuration, formatPrice } = useFormatters()

const expanded = ref(false)

function airlineLogo(iata: string) {
  if (!iata) return ''
  return 'https://assets.duffel.com/img/airlines/for-light-background/' + iata + '.svg'
}

function stopsLabel(stops: number) {
  if (stops === 0) return t('flightCard.direct')
  if (stops === 1) return '1 ' + t('flightCard.stop')
  return stops + ' ' + t('flightCard.stops')
}

function shortDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'short' })
}

function layoverMins(arr: string, dep: string): number {
  return Math.round((new Date(dep).getTime() - new Date(arr).getTime()) / 60000)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
    <div class="p-4 md:p-6">
      <div v-for="(slice, i) in offer.slices" :key="slice.id || i"
        :class="i > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''">
        <div v-if="offer.slices.length > 1"
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
          <span>{{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}</span>
        </div>
        <div class="flex items-center gap-3 md:gap-6">
          <div class="shrink-0 w-10 h-10 flex items-center justify-center">
            <img v-if="slice.segments && slice.segments[0] && slice.segments[0].carrier_iata"
              :src="airlineLogo(slice.segments[0].carrier_iata)"
              class="w-10 h-10 object-contain"
              @error="($event.target).style.display = 'none'"
            />
            <div v-else class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-sm">&#9992;</div>
          </div>
          <div class="flex-1 grid grid-cols-3 items-center gap-2">
            <div>
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
              <div class="text-sm font-semibold text-gray-700">{{ slice.origin && slice.origin.iata_code }}</div>
              <div class="text-xs text-gray-400">{{ shortDate(slice.departing_at) }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-1.5">{{ formatDuration(slice.duration_minutes) }}</div>
              <div class="relative flex items-center">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="text-xs mx-1 text-gray-400">&#9992;</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              <div class="text-xs mt-1.5 font-semibold"
                :class="slice.stops === 0 ? 'text-green-600' : 'text-orange-500'">
                {{ stopsLabel(slice.stops) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
              <div class="text-sm font-semibold text-gray-700">{{ slice.destination && slice.destination.iata_code }}</div>
              <div class="text-xs text-gray-400">{{ shortDate(slice.arriving_at) }}</div>
            </div>
          </div>
        </div>
        <div class="mt-2 ml-[52px] flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          <span v-if="slice.segments && slice.segments[0]" class="font-medium text-gray-500">
            {{ slice.segments[0].carrier_name }}
          </span>
          <span class="font-mono">
            {{ (slice.segments || []).map(s => s.flight_number).filter(Boolean).join(' · ') }}
          </span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-4">
          <div>
            <div class="text-2xl font-bold text-brand-600">{{ formatPrice(offer.total_amount, offer.total_currency) }}</div>
            <div class="text-xs text-gray-400">{{ t('flightCard.perPerson') }}</div>
          </div>
          <button @click="expanded = !expanded" class="text-xs text-brand-600 hover:underline hidden md:block">
            <span v-if="expanded">&#9650; Ascunde detalii</span>
            <span v-else>&#9660; Detalii zbor</span>
          </button>
        </div>
        <button @click="emit('select')"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm shrink-0">
          {{ t('flightCard.select') }}
        </button>
      </div>
    </div>

    <div v-if="expanded" class="border-t border-gray-100 bg-gray-50 rounded-b-2xl px-6 py-5">
      <div v-for="(slice, si) in offer.slices" :key="'exp'+si"
        :class="si > 0 ? 'mt-5 pt-5 border-t border-gray-200' : ''">
        <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-500 uppercase mb-3">
          {{ si === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
        </div>
        <template v-for="(seg, idx) in (slice.segments || [])" :key="seg.id || idx">
          <div v-if="idx > 0"
            class="flex items-center gap-2 my-3 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
            &#9200; Escala {{ formatDuration(layoverMins(slice.segments[idx-1].arriving_at, seg.departing_at)) }}
            in {{ (seg.origin && seg.origin.name) || (seg.origin && seg.origin.iata_code) }}
          </div>
          <div class="flex gap-4 items-start bg-white rounded-xl p-4 border border-gray-100 mb-2">
            <div class="shrink-0 w-8 h-8 flex items-center justify-center">
              <img v-if="seg.carrier_iata" :src="airlineLogo(seg.carrier_iata)"
                class="w-8 h-8 object-contain" @error="($event.target).style.display = 'none'" />
            </div>
            <div class="flex-1 text-sm">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-semibold text-gray-900">{{ seg.carrier_name }}</span>
                <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{{ seg.flight_number }}</span>
              </div>
              <div class="flex justify-between">
                <div>
                  <div class="font-bold text-gray-900">{{ formatTime(seg.departing_at) }}</div>
                  <div class="text-xs text-gray-500">{{ seg.origin && seg.origin.iata_code }} · {{ shortDate(seg.departing_at) }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">{{ formatTime(seg.arriving_at) }}</div>
                  <div class="text-xs text-gray-500">{{ seg.destination && seg.destination.iata_code }} · {{ shortDate(seg.arriving_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
