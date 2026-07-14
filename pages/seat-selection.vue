<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import type { SelectedSeat } from '~/stores/booking'

const { t } = useI18n()
const bookingStore = useBookingStore()
const router = useRouter()
const { formatPriceExact } = useFormatters()

useHead({ title: computed(() => t('seatSelection.title') + ' — YouFly'), meta: [{ name: 'robots', content: 'noindex' }] })

interface SeatService { serviceId: string; amount: string; currency: string }
interface SeatElement { type: string; designator?: string; disclosures?: string[]; services?: Record<string, SeatService> }
interface SeatRow { label: string | null; sections: SeatElement[][] }
interface SegmentMap { segmentId: string; sliceId: string; origin: string; destination: string; cabinClass: string; aisles: number; rows: SeatRow[] }

const loading = ref(true)
const available = ref(false)
const segments = ref<SegmentMap[]>([])
const activeSegmentIdx = ref(0)
const activePassengerIdx = ref(0)
const seatAnnouncement = ref('')

// key = `${segmentId}|${passengerId}` -> chosen seat
const selections = ref<Record<string, { serviceId: string; designator: string; amount: string; currency: string }>>({})

const passengers = computed(() => bookingStore.passengers)
const activeSegment = computed(() => segments.value[activeSegmentIdx.value])
const activePassenger = computed(() => passengers.value[activePassengerIdx.value])
const selKey = (segId: string, paxId: string) => `${segId}|${paxId}`

onMounted(async () => {
  if (!bookingStore.selectedOffer || !bookingStore.passengers.length) {
    router.push('/')
    return
  }
  for (const s of bookingStore.selectedSeats) {
    selections.value[selKey(s.segmentId, s.passengerId)] = { serviceId: s.serviceId, designator: s.designator, amount: s.amount, currency: s.currency }
  }
  try {
    const res = await $fetch<{ segments: SegmentMap[]; available: boolean }>(`/api/seat-map?offer_id=${bookingStore.selectedOffer.id}`)
    segments.value = (res.segments || []).filter(s => s.rows?.length)
    available.value = res.available && segments.value.length > 0
  } catch {
    available.value = false
  } finally {
    loading.value = false
  }
})

function seatStatus(el: SeatElement): 'mine' | 'other' | 'free' | 'taken' {
  if (el.type !== 'seat' || !el.designator) return 'taken'
  const seg = activeSegment.value
  const pax = activePassenger.value
  if (!seg || !pax) return 'taken'
  const mine = selections.value[selKey(seg.segmentId, pax.duffelPassengerId)]
  if (mine?.designator === el.designator) return 'mine'
  for (const p of passengers.value) {
    if (p.duffelPassengerId === pax.duffelPassengerId) continue
    if (selections.value[selKey(seg.segmentId, p.duffelPassengerId)]?.designator === el.designator) return 'other'
  }
  return el.services && el.services[pax.duffelPassengerId] ? 'free' : 'taken'
}

function seatPrice(el: SeatElement): SeatService | null {
  const pax = activePassenger.value
  return (pax && el.services && el.services[pax.duffelPassengerId]) || null
}

function selectSeat(el: SeatElement) {
  const status = seatStatus(el)
  if (status === 'taken' || status === 'other') return
  const seg = activeSegment.value
  const pax = activePassenger.value
  if (!seg || !pax || !el.designator) return
  const key = selKey(seg.segmentId, pax.duffelPassengerId)

  if (status === 'mine') {
    delete selections.value[key]
    seatAnnouncement.value = t('seatSelection.seatDeselected', { seat: el.designator })
    return
  }
  const svc = seatPrice(el)
  if (!svc) return
  selections.value[key] = { serviceId: svc.serviceId, designator: el.designator, amount: svc.amount, currency: svc.currency }
  seatAnnouncement.value = t('seatSelection.seatSelected', { seat: el.designator, name: `${pax.given_name} ${pax.family_name}` })
  const next = passengers.value.findIndex((p, i) => i > activePassengerIdx.value && !selections.value[selKey(seg.segmentId, p.duffelPassengerId)])
  if (next >= 0) activePassengerIdx.value = next
}

function seatClass(el: SeatElement): string {
  const base = 'w-8 h-8 rounded-t-lg text-[10px] font-semibold flex items-center justify-center transition-all border-b-2 shrink-0'
  const s = seatStatus(el)
  if (s === 'taken') return base + ' bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
  if (s === 'other') return base + ' bg-brand-200 border-brand-400 text-brand-700 cursor-not-allowed'
  if (s === 'mine') return base + ' bg-brand-600 border-brand-800 text-white scale-110 shadow-md cursor-pointer'
  return base + ' bg-green-50 border-green-400 text-green-700 hover:bg-green-200 cursor-pointer'
}

function paxSeatLabel(paxId: string): string | null {
  const seg = activeSegment.value
  if (!seg) return null
  return selections.value[selKey(seg.segmentId, paxId)]?.designator || null
}

const runningTotal = computed(() =>
  Object.values(selections.value).reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
)
const totalCurrency = computed(() =>
  Object.values(selections.value)[0]?.currency || bookingStore.selectedOffer?.total_currency || 'EUR'
)
const selectedCount = computed(() => Object.keys(selections.value).length)

function commitAndGo() {
  const seats: SelectedSeat[] = []
  for (const seg of segments.value) {
    for (const p of passengers.value) {
      const sel = selections.value[selKey(seg.segmentId, p.duffelPassengerId)]
      if (sel) seats.push({ serviceId: sel.serviceId, passengerId: p.duffelPassengerId, segmentId: seg.segmentId, designator: sel.designator, amount: sel.amount, currency: sel.currency })
    }
  }
  bookingStore.setSelectedSeats(seats)
  router.push('/payment')
}

function skip() {
  bookingStore.setSelectedSeats([])
  router.push('/payment')
}
</script>

<template>
  <div>
    <BookingSteps :current="2" />
    <DestinationPhoto v-if="bookingStore.selectedOffer" :code="bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code || ''" height-class="h-20">
      <div class="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/80"></div>
      <div class="relative z-10 flex items-center justify-center h-full text-white font-black text-xl tracking-wider">
        {{ bookingStore.selectedOffer.slices?.[0]?.origin?.iata_code }}
        <span aria-hidden="true" class="mx-3 text-brand-400">✈</span>
        {{ bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code }}
      </div>
    </DestinationPhoto>

    <div class="max-w-5xl mx-auto px-4 py-6">
      <div aria-live="polite" aria-atomic="true" class="sr-only">{{ seatAnnouncement }}</div>
      <div class="flex items-center gap-3 mb-6">
        <button @click="router.back()" class="text-gray-500 hover:text-gray-700 text-sm">{{ t('seatSelection.back') }}</button>
        <h1 class="text-2xl font-bold text-gray-900">{{ t('seatSelection.title') }}</h1>
        <button @click="skip" class="ml-auto text-sm text-gray-500 hover:text-brand-600 underline">{{ t('seatSelection.skip') }}</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" role="status" :aria-label="t('common.loading')" class="flex flex-col items-center gap-3 py-20">
        <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400">{{ t('seatSelection.loading') }}</p>
      </div>

      <!-- No seat map available -->
      <div v-else-if="!available" class="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg mx-auto">
        <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
        </div>
        <p class="font-semibold text-gray-900 mb-1">{{ t('seatSelection.unavailable') }}</p>
        <p class="text-sm text-gray-500 mb-5">{{ t('seatSelection.unavailableDesc') }}</p>
        <button @click="skip" class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">{{ t('seatSelection.continueWithoutSeat') }}</button>
      </div>

      <!-- Real seat map -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <!-- Segment tabs (multi-leg) -->
          <div v-if="segments.length > 1" class="flex gap-2 mb-3 flex-wrap">
            <button v-for="(seg, i) in segments" :key="seg.segmentId"
              @click="activeSegmentIdx = i"
              :aria-pressed="activeSegmentIdx === i"
              class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              :class="activeSegmentIdx === i ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              {{ seg.origin }} <span aria-hidden="true">→</span> {{ seg.destination }}
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-4 overflow-x-auto">
            <!-- Legend -->
            <div class="flex items-center gap-4 mb-4 text-xs flex-wrap justify-center">
              <div class="flex items-center gap-1.5"><div aria-hidden="true" class="w-5 h-5 bg-green-50 border-b-2 border-green-400 rounded-t-sm"></div> {{ t('seatSelection.available') }}</div>
              <div class="flex items-center gap-1.5"><div aria-hidden="true" class="w-5 h-5 bg-brand-600 border-b-2 border-brand-800 rounded-t-sm"></div> {{ t('seatSelection.selected') }}</div>
              <div class="flex items-center gap-1.5"><div aria-hidden="true" class="w-5 h-5 bg-gray-200 border-b-2 border-gray-300 rounded-t-sm"></div> {{ t('seatSelection.taken') }}</div>
            </div>

            <div aria-hidden="true" class="text-center text-3xl mb-2">✈</div>

            <!-- Seat grid -->
            <div class="flex flex-col items-center gap-1 min-w-[280px]">
              <div v-for="(row, ri) in activeSegment.rows" :key="ri" class="flex items-center gap-1 justify-center">
                <div class="w-7 text-[10px] text-right text-gray-400 font-mono shrink-0">{{ row.label }}</div>
                <template v-for="(section, si) in row.sections" :key="si">
                  <div v-if="si > 0" aria-hidden="true" class="w-5"></div>
                  <template v-for="(el, ei) in section" :key="ei">
                    <button v-if="el.type === 'seat' && el.designator"
                      :class="seatClass(el)"
                      :disabled="seatStatus(el) === 'taken' || seatStatus(el) === 'other'"
                      :aria-label="`${t('seatSelection.seat')} ${el.designator} — ${seatStatus(el) === 'taken' ? t('seatSelection.taken') : seatStatus(el) === 'mine' ? t('seatSelection.selected') : t('seatSelection.available')}${seatPrice(el) ? ' ' + formatPriceExact(seatPrice(el)!.amount, seatPrice(el)!.currency) : ''}`"
                      :aria-pressed="seatStatus(el) === 'mine'"
                      @click="selectSeat(el)">
                      {{ el.designator.replace(/^\d+/, '') }}
                    </button>
                    <div v-else aria-hidden="true" class="w-8 h-8 shrink-0"></div>
                  </template>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 class="font-semibold text-gray-900 mb-1">{{ t('seatSelection.passengers') }}</h3>
            <p v-if="segments.length > 1 && activeSegment" class="text-xs text-gray-400 mb-3">{{ activeSegment.origin }} → {{ activeSegment.destination }}</p>
            <div class="space-y-2">
              <button v-for="(p, i) in passengers" :key="p.duffelPassengerId"
                @click="activePassengerIdx = i"
                :aria-pressed="activePassengerIdx === i"
                class="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                :class="activePassengerIdx === i ? 'bg-brand-50 border border-brand-200' : 'bg-gray-50 border border-transparent hover:border-gray-200'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  :class="activePassengerIdx === i ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'">
                  {{ p.given_name?.[0]?.toUpperCase() || '?' }}
                </div>
                <div class="flex-1 text-left min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ p.given_name }} {{ p.family_name }}</div>
                  <div v-if="paxSeatLabel(p.duffelPassengerId)" class="text-xs text-brand-600 font-semibold">{{ t('seatSelection.seatLabel') }} {{ paxSeatLabel(p.duffelPassengerId) }}</div>
                  <div v-else class="text-xs text-gray-400">{{ t('seatSelection.noSeat') }}</div>
                </div>
                <span v-if="paxSeatLabel(p.duffelPassengerId)" aria-hidden="true" class="text-green-500">✓</span>
                <span v-else aria-hidden="true" class="text-gray-300">○</span>
              </button>
            </div>
          </div>

          <div v-if="selectedCount" class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">{{ selectedCount }} {{ t('seatSelection.seatsChosen') }}</span>
              <span class="font-bold text-brand-600">{{ formatPriceExact(String(runningTotal.toFixed(2)), totalCurrency) }}</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">{{ t('seatSelection.addedToTotal') }}</p>
          </div>

          <button @click="commitAndGo"
            class="w-full py-4 font-semibold rounded-xl text-lg transition-colors shadow-lg"
            :class="selectedCount ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
            {{ selectedCount ? t('seatSelection.continueWithSeat') : t('seatSelection.continueWithoutSeat') }}
          </button>
          <p class="text-xs text-center text-gray-400">{{ t('seatSelection.optional') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
