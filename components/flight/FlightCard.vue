<script setup lang="ts">
import type { SimplifiedOffer } from '~/stores/offers'

const props = defineProps<{ offer: SimplifiedOffer }>()
const emit = defineEmits<{ select: [] }>()
const { t, locale } = useI18n()
const { formatTime, formatDuration } = useFormatters()
const { formatWithMdl } = useCurrency()

const expanded = ref(false)
const linkCopied = ref(false)
const { toggle: toggleCompare, isSelected: isCompareSelected, compareList } = useCompare()

async function copyLink() {
  const from = props.offer.slices[0]?.origin?.iata_code
  const to = props.offer.slices[props.offer.slices.length-1]?.destination?.iata_code
  const price = formatWithMdl(props.offer.total_amount, props.offer.total_currency)
  const text = t('flightCard.shareText', { from, to, price })
  if (navigator.share) {
    try { await navigator.share({ text, url: window.location.href }) } catch {}
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    linkCopied.value = true
    if (navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {}
}

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
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

function dayDiff(departure: string, arrival: string): number {
  if (!departure || !arrival) return 0
  const d1 = new Date(departure)
  const d2 = new Date(arrival)
  return Math.floor((d2.setHours(0,0,0,0) - d1.setHours(0,0,0,0)) / 86400000)
}

function layoverMins(arr: string, dep: string): number {
  return Math.round((new Date(dep).getTime() - new Date(arr).getTime()) / 60000)
}
</script>

<template>
  <article class="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200" :aria-label="offer.slices[0]?.origin?.iata_code + ' → ' + (offer.slices[offer.slices.length-1]?.destination?.iata_code || '') + ', ' + formatWithMdl(offer.total_amount, offer.total_currency)">
    <div class="p-4 md:p-6">
      <div v-for="(slice, i) in offer.slices" :key="slice.id || i"
        :class="i > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''">
        <div v-if="offer.slices.length > 1"
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span aria-hidden="true" class="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
          <span>{{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}</span>
        </div>
        <div class="flex items-center gap-3 md:gap-6">
          <div class="shrink-0 w-10 h-10 flex items-center justify-center">
            <div v-if="slice.segments && slice.segments[0] && slice.segments[0].carrier_iata"
              class="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black border border-brand-100"
              :title="slice.segments[0].carrier_name || slice.segments[0].carrier_iata">
              {{ slice.segments[0].carrier_iata }}
            </div>
            <!-- Hidden img for logo attempt -->
            <img v-if="false"
              :src="airlineLogo(slice.segments?.[0]?.carrier_iata || '')"
              alt=""
              class="w-10 h-10 object-contain"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div v-else aria-hidden="true" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-sm">&#9992;</div>
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
                <span aria-hidden="true" class="text-xs mx-1 text-gray-400">&#9992;</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              <div class="text-xs mt-1.5 font-semibold"
                :class="slice.stops === 0 ? 'text-green-600' : 'text-orange-500'">
                {{ stopsLabel(slice.stops) }}
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-baseline justify-end gap-1">
                <span class="text-xl md:text-2xl font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</span>
                <span v-if="dayDiff(slice.departing_at, slice.arriving_at) > 0"
                  class="text-xs text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded"
                  :aria-label="t('flightCard.nextDay', { n: dayDiff(slice.departing_at, slice.arriving_at) })">
                  +{{ dayDiff(slice.departing_at, slice.arriving_at) }}
                </span>
              </div>
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
            {{ (slice.segments || []).map((s: any) => s.flight_number).filter(Boolean).join(' · ') }}
          </span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div class="flex items-center gap-4">
          <div>
            <div class="text-2xl font-bold text-brand-600">{{ formatWithMdl(offer.total_amount, offer.total_currency) }}</div>
            <div class="text-xs text-gray-400">{{ t('flightCard.perPerson') }}</div>
          </div>
          <button @click="expanded = !expanded" :aria-expanded="expanded" :aria-controls="`flight-details-${offer.id}`" class="text-xs text-brand-600 hover:underline">
            <span v-if="expanded"><span aria-hidden="true">&#9650;</span> {{ t('flightCard.hideDetails') }}</span>
            <span v-else><span aria-hidden="true">&#9660;</span> {{ t('flightCard.details') }}</span>
          </button>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click.stop="copyLink"
            :title="linkCopied ? t('flightCard.copied') : t('flightCard.copyLink')"
            :aria-label="linkCopied ? t('flightCard.copied') : t('flightCard.copyLink')"
            class="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600">
            <svg v-if="linkCopied" class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          </button>
          <button @click.stop="toggleCompare(offer)"
            :disabled="!isCompareSelected(offer.id) && compareList.length >= 2"
            :title="isCompareSelected(offer.id) ? t('flightCard.removeCompare') : t('flightCard.compare')"
            :aria-label="isCompareSelected(offer.id) ? t('flightCard.removeCompare') : t('flightCard.compare')"
            :aria-pressed="isCompareSelected(offer.id)"
            class="p-2.5 border rounded-xl transition-colors text-sm"
            :class="isCompareSelected(offer.id)
              ? 'bg-purple-100 border-purple-400 text-purple-700'
              : 'border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
          </button>
          <button @click="emit('select')"
            :aria-label="t('flightCard.selectFlight', { from: offer.slices[0]?.origin?.iata_code || '', to: offer.slices[offer.slices.length-1]?.destination?.iata_code || '', price: formatWithMdl(offer.total_amount, offer.total_currency) })"
            class="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-brand-500/30 hover:shadow-xl hover:scale-[1.02] glow-cta">
            {{ t('flightCard.select') }}
          </button>
        </div>
      </div>
    </div>

    <Transition name="expand">
    <div v-if="expanded" :id="`flight-details-${offer.id}`" class="border-t border-gray-100 bg-gray-50 rounded-b-2xl px-6 py-5">
      <div v-for="(slice, si) in offer.slices" :key="'exp'+si"
        :class="si > 0 ? 'mt-5 pt-5 border-t border-gray-200' : ''">
        <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-500 uppercase mb-3">
          {{ si === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
        </div>
        <template v-for="(seg, idx) in (slice.segments || [])" :key="seg.id || idx">
          <div v-if="(idx as number) > 0"
            class="flex items-center gap-2 my-3 text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ t('flightCard.layover') }} {{ formatDuration(layoverMins(slice.segments[(idx as number)-1].arriving_at, seg.departing_at)) }}
            {{ t('flightCard.layoverIn') }} {{ (seg.origin && seg.origin.name) || (seg.origin && seg.origin.iata_code) }}
          </div>
          <div class="flex gap-4 items-start bg-white rounded-xl p-4 border border-gray-100 mb-2">
            <div class="shrink-0 w-8 h-8 flex items-center justify-center">
              <img v-if="seg.carrier_iata" :src="airlineLogo(seg.carrier_iata)"
                :alt="seg.carrier_name || seg.carrier_iata" class="w-8 h-8 object-contain" @error="($event.target as HTMLImageElement).style.display = 'none'" />
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
                  <div class="text-xs text-gray-400 mt-0.5">{{ seg.origin && (seg.origin.name || seg.origin.city_name) }}</div>
                </div>
                <div class="text-center text-xs text-gray-400">
                  <div>{{ seg.duration ? formatDuration(seg.duration) : '' }}</div>
                  <div class="w-20 h-px bg-gray-200 my-1 mx-auto"></div>
                  <div v-if="seg.aircraft">{{ seg.aircraft.name || seg.aircraft.iata_code }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">{{ formatTime(seg.arriving_at) }}</div>
                  <div class="text-xs text-gray-500">{{ seg.destination && seg.destination.iata_code }} · {{ shortDate(seg.arriving_at) }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">{{ seg.destination && (seg.destination.name || seg.destination.city_name) }}</div>
                </div>
              </div>
              <!-- Baggage for this segment -->
              <div v-if="offer.passengers?.[0]?.baggages?.length" class="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                <span v-for="bag in offer.passengers[0].baggages" :key="bag.type"
                  class="text-xs px-2 py-1 rounded-full"
                  :class="bag.type === 'checked' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'">
                  <svg v-if="bag.type === 'checked'" class="w-3 h-3 inline-block mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  <svg v-else class="w-3 h-3 inline-block mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {{ bag.quantity }}× {{ bag.type === 'checked' ? t('flightCard.checkedBag') : t('flightCard.cabinBag') }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    </Transition>
  </article>
</template>

<style scoped>
.expand-enter-active, .expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 600px; }
</style>
