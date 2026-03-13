<script setup lang="ts">
const { t } = useI18n()
useHead({ title: computed(() => t('myBooking.title') + ' — YouFly') })

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
    booking.value = await $fetch<any>('/api/booking/' + refInput.value.trim().toUpperCase())
  } catch (e: any) {
    error.value = e?.data?.message === 'Booking not found' ? t('myBooking.notFound') : t('myBooking.error')
  } finally {
    isLoading.value = false
  }
}

function shortDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-MD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

if (route.query.ref) lookup()
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="text-center mb-8">
      <div class="text-5xl mb-4">&#128196;</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('myBooking.title') }}</h1>
      <p class="text-gray-500">{{ t('myBooking.subtitle') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex gap-3">
        <input v-model="refInput" type="text" :placeholder="t('myBooking.placeholder')"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase tracking-widest text-center text-xl"
          @keyup.enter="lookup" maxlength="10" />
        <button @click="lookup" :disabled="isLoading || !refInput.trim()"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors min-w-[100px]">
          <span v-if="isLoading" class="flex justify-center">
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          <span v-else>{{ t('myBooking.search') }}</span>
        </button>
      </div>
      <p v-if="error" class="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-xl text-center">{{ error }}</p>
    </div>

    <div v-if="booking" class="space-y-4">
      <!-- Status card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-start justify-between mb-5">
          <div>
            <p class="text-xs text-gray-500 mb-1">{{ t('myBooking.reference') }}</p>
            <p class="text-3xl font-mono font-bold text-brand-600 tracking-widest">{{ booking.reference }}</p>
          </div>
          <span class="px-3 py-1.5 rounded-full text-sm font-semibold"
            :class="booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
            {{ booking.status === 'confirmed' ? '&#10003; ' + t('myBooking.confirmed') : booking.status }}
          </span>
        </div>

        <!-- Flight from raw_offer -->
        <div v-if="booking.raw_offer && booking.raw_offer.slices" class="space-y-3 mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Zborul rezervat</h3>
          <div v-for="(slice, i) in booking.raw_offer.slices" :key="i"
            class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
                <div class="text-sm font-medium text-gray-700">{{ slice.origin && slice.origin.iata_code }}</div>
                <div class="text-xs text-gray-400">{{ shortDate(slice.departing_at) }}</div>
              </div>
              <div class="text-2xl text-gray-300">&#9992;</div>
              <div class="text-right">
                <div class="text-lg font-bold text-gray-900">{{ formatTime(slice.arriving_at) }}</div>
                <div class="text-sm font-medium text-gray-700">{{ slice.destination && slice.destination.iata_code }}</div>
                <div class="text-xs text-gray-400">{{ shortDate(slice.arriving_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">{{ t('myBooking.totalPaid') }}</span>
            <span class="font-bold text-xl text-gray-900">{{ formatPrice(booking.total_amount, booking.currency) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">{{ t('myBooking.bookedOn') }}</span>
            <span class="text-gray-600">{{ formatDate(booking.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Passengers card -->
      <div v-if="booking.passengers && booking.passengers.length" class="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-3 text-sm">{{ t('myBooking.passengersTitle') }}</h3>
        <div class="space-y-2">
          <div v-for="pp in booking.passengers" :key="pp.id"
            class="flex items-center gap-3 text-sm bg-gray-50 rounded-xl px-4 py-3">
            <span class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold shrink-0">
              {{ pp.first_name && pp.first_name[0] && pp.first_name[0].toUpperCase() }}
            </span>
            <div class="flex-1">
              <span class="text-gray-900 font-medium">{{ pp.first_name }} {{ pp.last_name }}</span>
              <span v-if="pp.email" class="text-gray-400 text-xs block">{{ pp.email }}</span>
            </div>
            <span class="text-gray-400 text-xs capitalize bg-white border border-gray-200 px-2 py-1 rounded-full">{{ pp.type }}</span>
          </div>
        </div>
      </div>

      <NuxtLink to="/" class="block text-center py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        &#8592; Caută alt zbor
      </NuxtLink>
    </div>
  </div>
</template>
