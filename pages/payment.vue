<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t } = useI18n()
useHead({ title: computed(() => `${t('payment.title')} — YouFly`), meta: [{ name: 'robots', content: 'noindex' }] })

const bookingStore = useBookingStore()
const router = useRouter()

onMounted(() => {
  if (!bookingStore.selectedOffer || !bookingStore.passengers.length) {
    router.push('/')
  }
})

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardName = ref('')
const isProcessing = ref(false)
const payErrors = ref<Record<string, string>>({})
const { formatPrice, formatTime, stopsLabel } = useFormatters()
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

function cardBrand(num: string): string {
  const n = num.replace(/\s/g, '')
  if (n.startsWith('4')) return 'VISA'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'MC'
  if (/^3[47]/.test(n)) return 'AMEX'
  return '••••'
}

function validateCard(): boolean {
  payErrors.value = {}
  const digits = cardNumber.value.replace(/\s/g, '')
  if (digits.length < 13) payErrors.value.cardNumber = t('payment.errorCardNumber')
  if (!cardName.value.trim()) payErrors.value.cardName = t('payment.errorRequired')
  if (cardExpiry.value.length < 5) payErrors.value.cardExpiry = t('payment.errorExpiry')
  if (cardCvv.value.length < 3) payErrors.value.cardCvv = t('payment.errorCvv')
  return Object.keys(payErrors.value).length === 0
}

async function pay() {
  if (!validateCard()) return
  isProcessing.value = true
  await new Promise(r => setTimeout(r, 1800))
  const ok = await bookingStore.submitBooking()
  isProcessing.value = false
  if (ok) router.push('/booking-confirm')
}

function formatCardNumber(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 16)
  cardNumber.value = v.replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(e: Event) {
  let v = (e.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 4)
  if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2)
  cardExpiry.value = v
}
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
      <!-- Card form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          </div>
          <h2 class="font-semibold text-gray-900">{{ t('payment.cardDetails') }}</h2>
          <!-- Accepted card brands with auto-highlight -->
          <div class="ml-auto flex items-center gap-1">
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors"
              :class="cardBrand(cardNumber) === 'VISA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-400 border-gray-200'">VISA</span>
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors"
              :class="cardBrand(cardNumber) === 'MC' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-400 border-gray-200'">MC</span>
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded border transition-colors"
              :class="cardBrand(cardNumber) === 'AMEX' ? 'bg-blue-800 text-white border-blue-800' : 'bg-gray-50 text-gray-400 border-gray-200'">AMEX</span>
          </div>
        </div>

        <!-- Card visual (decorative) -->
        <div aria-hidden="true" class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white rounded-2xl p-5 mb-6 h-44 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" style="background: radial-gradient(circle at 70% 30%, white 0%, transparent 60%)"></div>
          <div class="flex justify-between items-start relative z-10">
            <span class="text-sm font-medium opacity-80">YouFly</span>
            <span class="font-bold text-sm tracking-widest opacity-90">{{ cardNumber ? cardBrand(cardNumber) : '' }}</span>
            <span aria-hidden="true" class="text-3xl">✈</span>
          </div>
          <div class="font-mono text-xl tracking-[0.2em] relative z-10">{{ cardNumber || '•••• •••• •••• ••••' }}</div>
          <div class="flex justify-between items-end relative z-10">
            <div>
              <div class="text-xs opacity-60 mb-0.5">{{ t('payment.nameOnCard') }}</div>
              <div class="font-semibold uppercase text-sm">{{ cardName || '—' }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs opacity-60 mb-0.5">{{ t('payment.expiry') }}</div>
              <div class="font-semibold">{{ cardExpiry || 'MM/YY' }}</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="pay" novalidate class="space-y-4">
          <div>
            <label for="pay-cardnumber" class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.cardNumber') }}</label>
            <input id="pay-cardnumber" :value="cardNumber" @input="formatCardNumber" type="text" inputmode="numeric" maxlength="19"
              placeholder="1234 5678 9012 3456" :aria-invalid="!!payErrors.cardNumber"
              :aria-describedby="payErrors.cardNumber ? 'pay-cardnumber-error' : undefined"
              autocomplete="cc-number" required
              class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono tracking-wider"
              :class="payErrors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            <p v-if="payErrors.cardNumber" id="pay-cardnumber-error" role="alert" class="text-xs text-red-500 mt-1">{{ payErrors.cardNumber }}</p>
          </div>
          <div>
            <label for="pay-cardname" class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.nameOnCard') }}</label>
            <input id="pay-cardname" v-model="cardName" type="text" :placeholder="t('payment.nameOnCardPlaceholder')"
              :aria-invalid="!!payErrors.cardName"
              :aria-describedby="payErrors.cardName ? 'pay-cardname-error' : undefined"
              autocomplete="cc-name" required
              class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              :class="payErrors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            <p v-if="payErrors.cardName" id="pay-cardname-error" role="alert" class="text-xs text-red-500 mt-1">{{ payErrors.cardName }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="pay-expiry" class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.expiry') }}</label>
              <input id="pay-expiry" :value="cardExpiry" @input="formatExpiry" type="text" inputmode="numeric" maxlength="5" placeholder="MM/YY"
                :aria-invalid="!!payErrors.cardExpiry"
                :aria-describedby="payErrors.cardExpiry ? 'pay-expiry-error' : undefined"
                autocomplete="cc-exp" required
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                :class="payErrors.cardExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              <p v-if="payErrors.cardExpiry" id="pay-expiry-error" role="alert" class="text-xs text-red-500 mt-1">{{ payErrors.cardExpiry }}</p>
            </div>
            <div>
              <label for="pay-cvv" class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.cvv') }}</label>
              <input id="pay-cvv" v-model="cardCvv" type="text" inputmode="numeric" maxlength="4" placeholder="•••"
                :aria-invalid="!!payErrors.cardCvv"
                :aria-describedby="payErrors.cardCvv ? 'pay-cvv-error' : undefined"
                autocomplete="cc-csc" required
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                :class="payErrors.cardCvv ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              <p v-if="payErrors.cardCvv" id="pay-cvv-error" role="alert" class="text-xs text-red-500 mt-1">{{ payErrors.cardCvv }}</p>
            </div>
          </div>

        <p v-if="bookingStore.bookingError" role="alert" class="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{{ bookingStore.bookingError }}</p>

        <button type="submit" :disabled="isProcessing || !cardName.trim() || isExpired"
          class="mt-6 w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-all shadow-lg hover:shadow-brand-500/30 hover:shadow-xl glow-cta">
          <span v-if="isProcessing" class="flex items-center justify-center gap-2">
            <div role="status" :aria-label="t('common.loading')" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ t('payment.processing') }}
          </span>
          <span v-else>
            {{ t('payment.pay') }} {{ bookingStore.selectedOffer ? formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) : '' }}
          </span>
        </button>
        <p class="text-xs text-center text-gray-400 mt-3">{{ t('payment.demo') }}</p>

        <!-- Trust seals -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-center gap-4 text-xs text-gray-400 mb-3">
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
          <p class="text-[10px] text-gray-300 text-center">{{ t('payment.processor') }}</p>
        </div>
        </form>
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
              <div class="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>{{ t('payment.total') }}</span>
                <div class="text-right">
                  <span class="text-brand-600 text-xl">{{ formatWithMdl(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
                  <span v-if="showMdl" class="block text-xs text-gray-400 font-normal">≈ {{ formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
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
