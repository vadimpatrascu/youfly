<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

useHead({ title: 'Booking Confirmed — YouFly' })

const bookingStore = useBookingStore()
const router = useRouter()

if (!bookingStore.confirmedBooking) navigateTo('/my-booking')

const { formatPrice } = useFormatters()
const booking = computed(() => bookingStore.confirmedBooking)

const copied = ref(false)
function copyRef() {
  navigator.clipboard.writeText(booking.value?.reference || '')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-4xl">✅</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
      <p class="text-gray-500">Your flight has been booked successfully. A confirmation email has been sent.</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="text-center mb-6">
        <p class="text-sm text-gray-500 mb-2">Booking Reference</p>
        <div class="flex items-center justify-center gap-3">
          <span class="text-3xl font-mono font-bold text-brand-600 tracking-widest">{{ booking?.reference }}</span>
          <button @click="copyRef" class="px-3 py-1.5 text-xs border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors">
            {{ copied ? '✓ Copied' : 'Copy' }}
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">Save this reference to manage your booking</p>
      </div>

      <div v-if="booking" class="border-t pt-4 space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Total Paid</span>
          <span class="font-bold text-gray-900">{{ formatPrice(booking.totalAmount, booking.currency) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Duffel Order ID</span>
          <span class="text-gray-600 font-mono text-xs">{{ booking.duffelOrderId }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <NuxtLink :to="`/my-booking?ref=${booking?.reference}`" class="flex-1 py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        View Booking
      </NuxtLink>
      <NuxtLink to="/" class="flex-1 py-3 bg-brand-600 hover:bg-brand-700 rounded-xl text-center text-sm font-medium text-white transition-colors">
        Book Another Flight
      </NuxtLink>
    </div>
  </div>
</template>
