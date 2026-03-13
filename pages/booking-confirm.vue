<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t } = useI18n()
useHead({ title: computed(() => t('confirm.title') + ' — YouFly') })

const bookingStore = useBookingStore()
const router = useRouter()

onMounted(() => {
  if (!bookingStore.confirmedBooking) router.push('/my-booking')
})

const { formatPrice, formatTime } = useFormatters()
const booking = computed(() => bookingStore.confirmedBooking)
const offer = computed(() => bookingStore.selectedOffer)
const copied = ref(false)

function copyRef() {
  if (booking.value && booking.value.reference) {
    navigator.clipboard.writeText(booking.value.reference)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function shortDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-MD', { weekday: 'short', day: 'numeric', month: 'long' })
}
</script>

<template>
  <div>
    <BookingSteps :current="3" />

    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Success header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-4xl">&#10003;</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('confirm.title') }}</h1>
        <p class="text-gray-500">{{ t('confirm.subtitle') }}</p>
      </div>

      <!-- Reference card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div class="text-center bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-5 mb-5">
          <p class="text-sm text-gray-500 mb-2">{{ t('confirm.reference') }}</p>
          <div class="flex items-center justify-center gap-3">
            <span class="text-4xl font-mono font-bold text-brand-600 tracking-[0.2em]">{{ booking && booking.reference }}</span>
            <button @click="copyRef"
              class="px-3 py-1.5 text-xs border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium">
              {{ copied ? t('confirm.copied') : t('confirm.copy') }}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-2">{{ t('confirm.saveHint') }}</p>
        </div>

        <!-- Flight summary -->
        <div v-if="offer" class="space-y-3 mb-4">
          <div v-for="(slice, i) in offer.slices" :key="i"
            class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div v-if="offer.slices.length > 1" class="text-xs font-semibold text-gray-400 uppercase mb-2">
              {{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
                <div class="text-sm text-gray-600 font-medium">{{ slice.origin && slice.origin.iata_code }}</div>
                <div class="text-xs text-gray-400">{{ shortDate(slice.departing_at) }}</div>
              </div>
              <div class="text-center text-gray-400 text-2xl">&#9992;</div>
              <div class="text-right">
                <div class="text-lg font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
                <div class="text-sm text-gray-600 font-medium">{{ slice.destination && slice.destination.iata_code }}</div>
                <div class="text-xs text-gray-400">{{ shortDate(slice.arriving_at) }}</div>
              </div>
            </div>
            <div class="mt-2 text-xs text-gray-400">
              {{ (slice.segments || []).map((s: any) => s.carrier_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ') }}
              &#183; {{ (slice.segments || []).map((s: any) => s.flight_number).filter(Boolean).join(' + ') }}
            </div>
          </div>
        </div>

        <!-- Payment summary -->
        <div v-if="booking" class="space-y-2 text-sm pt-3 border-t">
          <div class="flex justify-between items-center">
            <span class="text-gray-500">{{ t('confirm.totalPaid') }}</span>
            <span class="text-xl font-bold text-gray-900">{{ formatPrice(booking.totalAmount, booking.currency) }}</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-400">{{ t('confirm.orderId') }}</span>
            <span class="text-gray-500 font-mono truncate max-w-[160px]">{{ booking.duffelOrderId }}</span>
          </div>
        </div>
      </div>

      <!-- Passengers -->
      <div v-if="bookingStore.passengers.length" class="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm">Pasageri</h3>
        <div class="space-y-2">
          <div v-for="p in bookingStore.passengers" :key="p.duffelPassengerId"
            class="flex items-center gap-3 text-sm">
            <span class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
              {{ p.given_name && p.given_name[0] && p.given_name[0].toUpperCase() }}
            </span>
            <span class="font-medium text-gray-900">{{ p.given_name }} {{ p.family_name }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
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
