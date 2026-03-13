<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t } = useI18n()
useHead({ title: computed(() => `${t('confirm.title')} — YouFly`) })

const bookingStore = useBookingStore()
const router = useRouter()

onMounted(() => {
  if (!bookingStore.confirmedBooking) router.push('/my-booking')
})

const { formatPrice } = useFormatters()
const booking = computed(() => bookingStore.confirmedBooking)
const copied = ref(false)

function copyRef() {
  if (booking.value?.reference) {
    navigator.clipboard.writeText(booking.value.reference)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div>
    <BookingSteps :current="3" />
    <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-4xl">✅</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('confirm.title') }}</h1>
      <p class="text-gray-500">{{ t('confirm.subtitle') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="text-center mb-6 bg-brand-50 rounded-xl p-5">
        <p class="text-sm text-gray-500 mb-2">{{ t('confirm.reference') }}</p>
        <div class="flex items-center justify-center gap-3">
          <span class="text-4xl font-mono font-bold text-brand-600 tracking-[0.2em]">{{ booking?.reference }}</span>
          <button @click="copyRef"
            class="px-3 py-1.5 text-xs border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium">
            {{ copied ? t('confirm.copied') : t('confirm.copy') }}
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-2">{{ t('confirm.saveHint') }}</p>
      </div>

      <div v-if="booking" class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-gray-500">{{ t('confirm.totalPaid') }}</span>
          <span class="text-xl font-bold text-gray-900">{{ formatPrice(booking.totalAmount, booking.currency) }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400">{{ t('confirm.orderId') }}</span>
          <span class="text-gray-500 font-mono">{{ booking.duffelOrderId }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <NuxtLink :to="`/my-booking?ref=${booking?.reference}`"
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
