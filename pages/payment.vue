<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t } = useI18n()
useHead({ title: computed(() => `${t('payment.title')} — YouFly`) })

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
  if (digits.length < 13) payErrors.value.cardNumber = 'Număr card invalid'
  if (!cardName.value.trim()) payErrors.value.cardName = 'Câmp obligatoriu'
  if (cardExpiry.value.length < 5) payErrors.value.cardExpiry = 'Data expirare invalidă'
  if (cardCvv.value.length < 3) payErrors.value.cardCvv = 'CVV invalid'
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Card form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <span class="text-2xl">💳</span>
          <h2 class="font-semibold text-gray-900">{{ t('payment.cardDetails') }}</h2>
          <span class="ml-auto text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">{{ t('payment.secure') }}</span>
        </div>

        <!-- Card visual -->
        <div class="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white rounded-2xl p-5 mb-6 h-44 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div class="absolute inset-0 opacity-10" style="background: radial-gradient(circle at 70% 30%, white 0%, transparent 60%)"></div>
          <div class="flex justify-between items-start relative z-10">
            <span class="text-sm font-medium opacity-80">YouFly</span>
            <span class="font-bold text-sm tracking-widest opacity-90">{{ cardNumber ? cardBrand(cardNumber) : '' }}</span>
            <span class="text-3xl">✈</span>
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

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.cardNumber') }}</label>
            <input :value="cardNumber" @input="formatCardNumber" type="text" maxlength="19"
              placeholder="1234 5678 9012 3456"
              class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono tracking-wider"
              :class="payErrors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            <p v-if="payErrors.cardNumber" class="text-xs text-red-500 mt-1">{{ payErrors.cardNumber }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.nameOnCard') }}</label>
            <input v-model="cardName" type="text" :placeholder="t('payment.nameOnCardPlaceholder')"
              class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              :class="payErrors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            <p v-if="payErrors.cardName" class="text-xs text-red-500 mt-1">{{ payErrors.cardName }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.expiry') }}</label>
              <input :value="cardExpiry" @input="formatExpiry" type="text" maxlength="5" placeholder="MM/YY"
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                :class="payErrors.cardExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              <p v-if="payErrors.cardExpiry" class="text-xs text-red-500 mt-1">{{ payErrors.cardExpiry }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('payment.cvv') }}</label>
              <input v-model="cardCvv" type="text" maxlength="4" placeholder="•••"
                class="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                :class="payErrors.cardCvv ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
          </div>
        </div>

        <p v-if="bookingStore.bookingError" class="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{{ bookingStore.bookingError }}</p>

        <button @click="pay" :disabled="isProcessing || !cardName.trim()"
          class="mt-6 w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
          <span v-if="isProcessing" class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ t('payment.processing') }}
          </span>
          <span v-else>
            {{ t('payment.pay') }} {{ bookingStore.selectedOffer ? formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) : '' }}
          </span>
        </button>
        <p class="text-xs text-center text-gray-400 mt-3">{{ t('payment.demo') }}</p>

        <!-- Trust seals -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1">🔒 SSL Securizat</span>
            <span class="flex items-center gap-1">🛡️ PCI DSS</span>
            <span class="flex items-center gap-1">✓ 3D Secure</span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-4">{{ t('payment.orderSummary') }}</h3>
          <div v-if="bookingStore.selectedOffer" class="space-y-3">
            <div v-for="slice in bookingStore.selectedOffer.slices" :key="slice.id" class="text-sm pb-3 border-b last:border-0">
              <div class="font-medium text-gray-900">
                {{ slice.origin?.city_name }} ({{ slice.origin?.iata_code }}) → {{ slice.destination?.city_name }} ({{ slice.destination?.iata_code }})
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
              <span class="text-gray-400 text-xs capitalize ml-auto">{{ p.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
