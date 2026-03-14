<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t, locale } = useI18n()
useSeo({ title: t('confirm.title'), description: t('confirm.seoDesc') })

const bookingStore = useBookingStore()
const router = useRouter()

onMounted(() => {
  if (!bookingStore.confirmedBooking) router.push('/my-booking')
})

const { formatPrice, formatTime } = useFormatters()
const { formatWithMdl, showMdl } = useCurrency()
const booking = computed(() => bookingStore.confirmedBooking)
const offer = computed(() => bookingStore.selectedOffer)
const copied = ref(false)
const isPrinting = ref(false)

function copyRef() {
  if (booking.value && booking.value.reference) {
    navigator.clipboard.writeText(booking.value.reference)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function printBoardingPass() {
  isPrinting.value = true
  setTimeout(() => {
    window.print()
    isPrinting.value = false
  }, 100)
}

function shortDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric', month: 'long' })
}

function shortDateCompact(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <BookingSteps :current="4" />

    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Success header -->
      <div class="text-center mb-8 no-print">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" aria-hidden="true">
          <span class="text-4xl">&#10003;</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('confirm.title') }}</h1>
        <p class="text-gray-500">{{ t('confirm.subtitle') }}</p>
      </div>

      <!-- Boarding pass style card -->
      <div id="boarding-pass" class="boarding-pass bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-4">
        <!-- Header strip -->
        <div class="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="text-2xl">✈</span>
            <span class="font-bold text-lg tracking-wider">YouFly</span>
          </div>
          <div class="text-right">
            <div class="text-xs opacity-75">{{ t('confirm.reference') }}</div>
            <div class="font-mono font-bold text-xl tracking-[0.25em]">{{ booking && booking.reference }}</div>
          </div>
        </div>

        <!-- Flight info -->
        <div v-if="offer" class="divide-y divide-dashed divide-gray-200">
          <div v-for="(slice, i) in offer.slices" :key="i" class="px-6 py-5">
            <div v-if="offer.slices.length > 1" class="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
              {{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
            </div>
            <div class="flex items-center justify-between gap-4">
              <div class="text-center">
                <div class="text-3xl font-black text-gray-900">{{ slice.origin?.iata_code }}</div>
                <div class="text-sm text-gray-500 font-medium">{{ slice.origin?.city_name }}</div>
                <div class="text-lg font-bold text-gray-800 mt-1">{{ formatTime(slice.departing_at) }}</div>
                <div class="text-xs text-gray-400">{{ shortDateCompact(slice.departing_at) }}</div>
              </div>
              <div class="flex-1 text-center">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px border-t border-dashed border-gray-300"></div>
                  <span aria-hidden="true" class="text-xl text-gray-400">✈</span>
                  <div class="flex-1 h-px border-t border-dashed border-gray-300"></div>
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ slice.stops === 0 ? t('flightCard.direct') : slice.stops + ' ' + t('confirm.stopsLabel') }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-black text-gray-900">{{ slice.destination?.iata_code }}</div>
                <div class="text-sm text-gray-500 font-medium">{{ slice.destination?.city_name }}</div>
                <div class="text-lg font-bold text-gray-800 mt-1">{{ formatTime(slice.arriving_at) }}</div>
                <div class="text-xs text-gray-400">{{ shortDateCompact(slice.arriving_at) }}</div>
              </div>
            </div>
            <!-- Flight numbers -->
            <div class="mt-3 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <span>{{ (slice.segments || []).map((s: any) => s.carrier_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ') }}</span>
              <span v-if="(slice.segments || []).some((s: any) => s.flight_number)" class="font-mono bg-gray-100 px-2 py-0.5 rounded">
                {{ (slice.segments || []).map((s: any) => s.flight_number).filter(Boolean).join(' + ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tear line -->
        <div class="relative flex items-center px-6">
          <div class="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 -ml-8 shrink-0"></div>
          <div class="flex-1 border-t-2 border-dashed border-gray-200 mx-2"></div>
          <div class="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 -mr-8 shrink-0"></div>
        </div>

        <!-- Passengers + payment row -->
        <div class="px-6 py-4 grid grid-cols-2 gap-4 bg-gray-50">
          <div>
            <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">{{ t('steps.passengers') }}</div>
            <div class="space-y-1">
              <div v-for="p in bookingStore.passengers" :key="p.duffelPassengerId"
                class="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {{ p.given_name }} {{ p.family_name }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">{{ t('confirm.totalPaid') }}</div>
            <div class="text-2xl font-black text-brand-600">
              {{ booking ? formatWithMdl(booking.totalAmount, booking.currency) : '' }}
            </div>
            <div v-if="showMdl && booking" class="text-xs text-gray-400">≈ {{ formatPrice(booking.totalAmount, booking.currency) }}</div>
            <div class="text-xs text-gray-400 mt-1 font-mono">{{ booking?.duffelOrderId?.substring(0, 20) }}...</div>
          </div>
        </div>
      </div>

      <!-- Copy ref -->
      <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 flex items-center gap-3">
        <span aria-hidden="true" class="text-brand-600 text-xl">🎫</span>
        <div class="flex-1">
          <div class="text-sm text-gray-500 mb-1">{{ t('confirm.saveHint') }}</div>
          <div class="font-mono font-bold text-brand-700 text-xl tracking-widest">{{ booking && booking.reference }}</div>
        </div>
        <button @click="copyRef"
          :aria-label="copied ? t('confirm.copied') : t('confirm.copy')"
          class="px-4 py-2 border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium text-sm whitespace-nowrap">
          <span v-if="copied" aria-hidden="true">✓ </span>{{ copied ? t('confirm.copied') : t('confirm.copy') }}
        </button>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 flex-wrap no-print">
        <button @click="printBoardingPass"
          class="flex-1 py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <span aria-hidden="true">🖨️</span> {{ t('confirm.printSave') }}
        </button>
        <NuxtLink :to="'/my-booking?ref=' + (booking && booking.reference)"
          class="flex-1 py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {{ t('confirm.viewBooking') }}
        </NuxtLink>
        <NuxtLink to="/"
          class="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-xl text-center text-sm font-medium text-white transition-colors">
          {{ t('confirm.bookAnother') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  .no-print { display: none !important; }
  header, footer, nav { display: none !important; }
  body { background: white; }
  #boarding-pass {
    border: 2px solid #1a56db !important;
    box-shadow: none !important;
    margin: 0;
    max-width: 100%;
  }
}
</style>
