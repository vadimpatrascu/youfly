<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

useHead({ title: 'Payment — YouFly' })

const bookingStore = useBookingStore()
const router = useRouter()

if (!bookingStore.selectedOffer || !bookingStore.passengers.length) {
  navigateTo('/')
}

const cardNumber = ref('4242 4242 4242 4242')
const cardExpiry = ref('12/28')
const cardCvv = ref('123')
const cardName = ref('')
const isProcessing = ref(false)

const { formatPrice } = useFormatters()

async function pay() {
  if (!cardName.value.trim()) return
  isProcessing.value = true
  // Simulate payment processing delay
  await new Promise(r => setTimeout(r, 1500))
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
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2)
  cardExpiry.value = v
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-8">
      <button @click="router.back()" class="text-gray-500 hover:text-gray-700">← Back</button>
      <h1 class="text-2xl font-bold text-gray-900">Payment</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Card form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <span class="text-2xl">💳</span>
          <h2 class="font-semibold text-gray-900">Card Details</h2>
          <span class="ml-auto text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">🔒 Secure</span>
        </div>

        <!-- Card preview -->
        <div class="bg-gradient-to-br from-brand-600 to-brand-800 text-white rounded-2xl p-5 mb-6 h-40 flex flex-col justify-between shadow-xl">
          <div class="flex justify-between items-start">
            <span class="text-sm opacity-80">YouFly</span>
            <span class="text-2xl">✈</span>
          </div>
          <div class="font-mono text-lg tracking-widest">{{ cardNumber || '•••• •••• •••• ••••' }}</div>
          <div class="flex justify-between items-end">
            <div>
              <div class="text-xs opacity-70">Card Holder</div>
              <div class="font-medium">{{ cardName || 'YOUR NAME' }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs opacity-70">Expires</div>
              <div class="font-medium">{{ cardExpiry || 'MM/YY' }}</div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input :value="cardNumber" @input="formatCardNumber" type="text" maxlength="19" placeholder="1234 5678 9012 3456" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input v-model="cardName" type="text" placeholder="As it appears on card" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
              <input :value="cardExpiry" @input="formatExpiry" type="text" maxlength="5" placeholder="MM/YY" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input v-model="cardCvv" type="text" maxlength="4" placeholder="123" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
            </div>
          </div>
        </div>

        <p v-if="bookingStore.bookingError" class="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl">{{ bookingStore.bookingError }}</p>

        <button
          @click="pay"
          :disabled="isProcessing || !cardName.trim()"
          class="mt-6 w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-lg transition-colors"
        >
          <span v-if="isProcessing" class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </span>
          <span v-else>
            Pay {{ bookingStore.selectedOffer ? formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) : '' }}
          </span>
        </button>
        <p class="text-xs text-center text-gray-400 mt-3">🔒 This is a demo. No real payment is processed.</p>
      </div>

      <!-- Order summary -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div v-if="bookingStore.selectedOffer" class="space-y-3">
            <div v-for="slice in bookingStore.selectedOffer.slices" :key="slice.id" class="text-sm pb-3 border-b last:border-0">
              <div class="font-medium">{{ slice.origin.city_name }} ({{ slice.origin.iata_code }}) → {{ slice.destination.city_name }} ({{ slice.destination.iata_code }})</div>
              <div class="text-gray-500 mt-1">{{ slice.segments?.[0]?.carrier_name }} · {{ slice.stops === 0 ? 'Direct' : slice.stops + ' stop(s)' }}</div>
            </div>
            <div class="pt-2 space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Base fare</span>
                <span>{{ formatPrice(bookingStore.selectedOffer.base_amount || bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Taxes & fees</span>
                <span>{{ formatPrice(bookingStore.selectedOffer.tax_amount || '0', bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span class="text-brand-600 text-lg">{{ formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-3">Passengers</h3>
          <div class="space-y-2">
            <div v-for="p in bookingStore.passengers" :key="p.duffelPassengerId" class="flex items-center gap-2 text-sm">
              <span class="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{{ p.given_name?.[0]?.toUpperCase() }}</span>
              <span class="text-gray-900">{{ p.given_name }} {{ p.family_name }}</span>
              <span class="text-gray-400 text-xs capitalize ml-auto">{{ p.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
