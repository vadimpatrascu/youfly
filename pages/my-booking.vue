<script setup lang="ts">
const { t } = useI18n()
useHead({ title: computed(() => `${t('myBooking.title')} — YouFly`) })

const route = useRoute()
const refInput = ref((route.query.ref as string) || '')
const booking = ref<any>(null)
const isLoading = ref(false)
const error = ref('')
const { formatPrice, formatDate, formatTime } = useFormatters()

async function lookup() {
  if (!refInput.value.trim()) return
  isLoading.value = true
  error.value = ''
  booking.value = null
  try {
    booking.value = await $fetch<any>(`/api/booking/${refInput.value.trim().toUpperCase()}`)
  } catch (e: any) {
    error.value = e?.data?.message === 'Booking not found' ? t('myBooking.notFound') : t('myBooking.error')
  } finally {
    isLoading.value = false
  }
}

if (route.query.ref) lookup()
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('myBooking.title') }}</h1>
      <p class="text-gray-500">{{ t('myBooking.subtitle') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex gap-3">
        <input v-model="refInput" type="text" :placeholder="t('myBooking.placeholder')"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase tracking-widest"
          @keyup.enter="lookup" maxlength="10" />
        <button @click="lookup" :disabled="isLoading || !refInput.trim()"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors min-w-[100px]">
          <span v-if="isLoading" class="flex justify-center">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          <span v-else>{{ t('myBooking.search') }}</span>
        </button>
      </div>
      <p v-if="error" class="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">{{ error }}</p>
    </div>

    <div v-if="booking" class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex items-start justify-between mb-5">
        <div>
          <p class="text-xs text-gray-500 mb-1">{{ t('myBooking.reference') }}</p>
          <p class="text-3xl font-mono font-bold text-brand-600 tracking-widest">{{ booking.reference }}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-medium capitalize"
          :class="booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
          {{ booking.status === 'confirmed' ? t('myBooking.confirmed') : booking.status }}
        </span>
      </div>

      <div class="border-t pt-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('myBooking.totalPaid') }}</span>
          <span class="font-bold text-lg text-gray-900">{{ formatPrice(booking.total_amount, booking.currency) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('myBooking.bookedOn') }}</span>
          <span class="text-gray-700">{{ formatDate(booking.created_at) }}</span>
        </div>
      </div>

      <div v-if="booking.passengers?.length" class="mt-4 pt-4 border-t">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm">{{ t('myBooking.passengersTitle') }}</h3>
        <div class="space-y-2">
          <div v-for="p in booking.passengers" :key="p.id" class="flex items-center gap-3 text-sm bg-gray-50 rounded-xl px-4 py-3">
            <span class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
              {{ p.first_name?.[0]?.toUpperCase() }}
            </span>
            <div class="flex-1">
              <span class="text-gray-900 font-medium">{{ p.first_name }} {{ p.last_name }}</span>
              <span v-if="p.email" class="text-gray-400 text-xs block">{{ p.email }}</span>
            </div>
            <span class="text-gray-400 text-xs capitalize bg-white border border-gray-200 px-2 py-1 rounded-full">{{ p.type }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
