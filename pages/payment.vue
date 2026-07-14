<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t } = useI18n()
useHead({ title: computed(() => `${t('payment.title')} — YouFly`), meta: [{ name: 'robots', content: 'noindex' }] })

const bookingStore = useBookingStore()
const router = useRouter()

// Duffel Payments web component (Stripe-backed, PCI handled by Duffel)
const DUFFEL_COMPONENT_SRC = 'https://assets.duffel.com/components/3.16.1/duffel-payments.js'

const initState = ref<'loading' | 'ready' | 'unavailable'>('loading')
const isBookingTickets = ref(false)
const payError = ref('')
const paymentIntentId = ref('')
const clientToken = ref('')
const chargeAmount = ref('')
const chargeCurrency = ref('')
const seatTotal = ref('0')

const { formatPrice, formatPriceExact, formatTime, stopsLabel } = useFormatters()
const { formatWithMdl, showMdl } = useCurrency()

// Offer expiry countdown
const expiresAt = computed(() => bookingStore.selectedOffer?.expires_at || null)
const { formatted: countdownFormatted, isExpiringSoon, isExpired } = useCountdown(expiresAt)

function passengerTypeLabel(type: string) {
  if (type === 'adult') return t('passengers.adult')
  if (type === 'child') return t('passengers.child')
  if (type === 'infant_without_seat') return t('passengers.infant')
  return type
}

let scriptPromise: Promise<void> | null = null
function loadDuffelComponent(): Promise<void> {
  if (typeof customElements !== 'undefined' && customElements.get('duffel-payments')) {
    return Promise.resolve()
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = DUFFEL_COMPONENT_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { scriptPromise = null; reject(new Error('component_load_failed')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

async function onPaymentSucceeded() {
  payError.value = ''
  isBookingTickets.value = true
  const ok = await bookingStore.submitBooking(paymentIntentId.value)
  if (ok) {
    router.push('/booking-confirm')
  } else {
    isBookingTickets.value = false
  }
}

function onPaymentFailed() {
  // The component shows field-level card errors itself; this is the final failure event
  payError.value = t('payment.paymentFailed')
}

async function setupPayment() {
  const offer = bookingStore.selectedOffer
  if (!offer || isExpired.value) return
  initState.value = 'loading'
  payError.value = ''
  try {
    const intent = await $fetch<any>('/api/payment/intent', {
      method: 'POST',
      body: { offerId: offer.id, serviceIds: bookingStore.seatServiceIds },
    })
    paymentIntentId.value = intent.paymentIntentId
    clientToken.value = intent.clientToken
    chargeAmount.value = intent.amount
    chargeCurrency.value = intent.currency
    seatTotal.value = intent.seatTotal || '0'

    await loadDuffelComponent()
    initState.value = 'ready'
    await nextTick()

    const el = document.querySelector('duffel-payments') as any
    if (!el) throw new Error('element_missing')
    el.render({ paymentIntentClientToken: clientToken.value })
    el.addEventListener('onSuccessfulPayment', onPaymentSucceeded)
    el.addEventListener('onFailedPayment', onPaymentFailed)
  } catch {
    initState.value = 'unavailable'
  }
}

onMounted(() => {
  if (!bookingStore.selectedOffer || !bookingStore.passengers.length) {
    router.push('/')
    return
  }
  setupPayment()
})
</script>

<template>
  <div>
    <BookingSteps :current="3" />
    <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex items-center gap-3 mb-8">
      <button @click="router.back()" class="text-gray-500 hover:text-gray-700 text-sm">{{ t('payment.back') }}</button>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('payment.title') }}</h1>
    </div>

    <!-- Offer expiry countdown -->
    <div v-if="bookingStore.selectedOffer && !isExpired"
      class="mb-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border"
      :class="isExpiringSoon ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-brand-50 border-brand-100 text-brand-700'">
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span v-if="isExpiringSoon">{{ t('ticketOrder.expiringSoon', { time: countdownFormatted }) }}</span>
      <span v-else>{{ t('ticketOrder.reserved', { time: countdownFormatted }) }}</span>
    </div>
    <div v-if="isExpired" role="alert" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <p class="text-red-600 font-medium mb-3">{{ t('ticketOrder.expired') }}</p>
      <button @click="router.push('/')" class="px-6 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">{{ t('passengers.searchAgain') }}</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Payment column -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          </div>
          <h2 class="font-semibold text-gray-900">{{ t('payment.cardDetails') }}</h2>
        </div>

        <!-- Amount to charge (offer total + card processing fee) -->
        <div v-if="chargeAmount && !isExpired" class="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">{{ t('payment.total') }}</span>
            <span class="text-2xl font-black text-brand-600">{{ formatPriceExact(chargeAmount, chargeCurrency) }}</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ t('payment.processingFeeNote') }}</p>
        </div>

        <!-- Loading payment form -->
        <div v-if="initState === 'loading' && !isExpired" role="status" :aria-label="t('common.loading')" class="flex flex-col items-center gap-3 py-12">
          <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-400">{{ t('common.loading') }}</p>
        </div>

        <!-- Payments not available -->
        <div v-else-if="initState === 'unavailable'" role="alert" class="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
          <p class="text-orange-700 text-sm mb-4">{{ t('payment.unavailable') }}</p>
          <button @click="setupPayment" class="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">{{ t('payment.retry') }}</button>
        </div>

        <!-- Duffel Payments card form (Stripe-backed, 3D Secure included) -->
        <div v-show="initState === 'ready' && !isExpired && !isBookingTickets">
          <duffel-payments></duffel-payments>
        </div>

        <!-- Issuing tickets after successful charge -->
        <div v-if="isBookingTickets" role="status" class="flex flex-col items-center gap-3 py-10">
          <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-gray-700">{{ t('payment.issuingTickets') }}</p>
        </div>

        <p v-if="payError" role="alert" class="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{{ payError }}</p>
        <p v-if="bookingStore.bookingError" role="alert" class="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{{ bookingStore.bookingError }}</p>

        <!-- Trust seals -->
        <div class="mt-5 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              {{ t('payment.trustSsl') }}
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              {{ t('payment.trustPci') }}
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ t('payment.trust3d') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="space-y-4">
        <!-- Destination banner -->
        <DestinationPhoto v-if="bookingStore.selectedOffer" :code="bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code || ''" height-class="h-28 rounded-2xl">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div class="absolute bottom-3 left-4 right-4 text-white">
            <div class="font-black text-lg">
              {{ bookingStore.selectedOffer.slices?.[0]?.origin?.iata_code }}
              <span aria-hidden="true" class="mx-1 opacity-60">✈</span>
              {{ bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code }}
            </div>
          </div>
        </DestinationPhoto>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-4">{{ t('payment.orderSummary') }}</h3>
          <div v-if="bookingStore.selectedOffer" class="space-y-3">
            <div v-for="slice in bookingStore.selectedOffer.slices" :key="slice.id" class="text-sm pb-3 border-b last:border-0">
              <div class="font-medium text-gray-900">
                {{ slice.origin?.city_name }} ({{ slice.origin?.iata_code }}) <span aria-hidden="true">→</span> {{ slice.destination?.city_name }} ({{ slice.destination?.iata_code }})
              </div>
              <div class="text-gray-500 mt-1 flex items-center gap-2">
                <span>{{ formatTime(slice.departing_at) }} – {{ formatTime(slice.arriving_at) }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="slice.stops === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                  {{ stopsLabel(slice.stops) }}
                </span>
              </div>
            </div>
            <div class="space-y-2 pt-1">
              <div class="flex justify-between text-sm text-gray-500">
                <span>{{ t('payment.baseFare') }}</span>
                <span>{{ formatPrice(bookingStore.selectedOffer.base_amount || bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>{{ t('payment.taxes') }}</span>
                <span>{{ formatPrice(bookingStore.selectedOffer.tax_amount || '0', bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <div v-if="parseFloat(seatTotal) > 0" class="flex justify-between text-sm text-gray-500">
                <span>{{ t('payment.seats') }}</span>
                <span>{{ formatPriceExact(seatTotal, chargeCurrency) }}</span>
              </div>
              <div v-if="chargeAmount" class="flex justify-between text-sm text-gray-500">
                <span>{{ t('payment.processingFee') }}</span>
                <span>{{ formatPriceExact(String(Math.max(0, parseFloat(chargeAmount) - parseFloat(bookingStore.selectedOffer.total_amount) - parseFloat(seatTotal)).toFixed(2)), chargeCurrency) }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>{{ t('payment.total') }}</span>
                <div class="text-right">
                  <span v-if="!showMdl" class="text-brand-600 text-xl">{{ formatPriceExact(chargeAmount || bookingStore.selectedOffer.total_amount, chargeCurrency || bookingStore.selectedOffer.total_currency) }}</span>
                  <span v-else class="text-brand-600 text-xl">{{ formatWithMdl(chargeAmount || bookingStore.selectedOffer.total_amount, chargeCurrency || bookingStore.selectedOffer.total_currency) }}</span>
                  <span v-if="showMdl" class="block text-xs text-gray-400 font-normal">≈ {{ formatPriceExact(chargeAmount || bookingStore.selectedOffer.total_amount, chargeCurrency || bookingStore.selectedOffer.total_currency) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-3">{{ t('payment.passengers') }}</h3>
          <div class="space-y-2">
            <div v-for="p in bookingStore.passengers" :key="p.duffelPassengerId" class="flex items-center gap-2 text-sm">
              <span class="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                {{ p.given_name?.[0]?.toUpperCase() || '?' }}
              </span>
              <span class="text-gray-900">{{ p.given_name }} {{ p.family_name }}</span>
              <span class="text-gray-400 text-xs ml-auto">{{ passengerTypeLabel(p.type) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
