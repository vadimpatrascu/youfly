<script setup lang="ts">
useHead({ title: 'My Booking — YouFly' })

const route = useRoute()
const refInput = ref((route.query.ref as string) || '')
const booking = ref<any>(null)
const isLoading = ref(false)
const error = ref('')

const { formatPrice, formatDate, formatTime, stopsLabel } = useFormatters()

async function lookup() {
  if (!refInput.value.trim()) return
  isLoading.value = true
  error.value = ''
  booking.value = null
  try {
    booking.value = await $fetch<any>(`/api/booking/${refInput.value.trim().toUpperCase()}`)
  } catch (e: any) {
    error.value = e?.data?.message === 'Booking not found' ? 'No booking found with that reference.' : 'Error looking up booking.'
  } finally {
    isLoading.value = false
  }
}

if (route.query.ref) lookup()
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">My Booking</h1>
    <p class="text-gray-500 text-center mb-8">Enter your booking reference to view your flight details</p>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex gap-3">
        <input
          v-model="refInput"
          type="text"
          placeholder="e.g. ABCDEF"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
          @keyup.enter="lookup"
        />
        <button
          @click="lookup"
          :disabled="isLoading || !refInput.trim()"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          <span v-else>Search</span>
        </button>
      </div>
      <p v-if="error" class="mt-3 text-red-600 text-sm">{{ error }}</p>
    </div>

    <div v-if="booking" class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-sm text-gray-500">Booking Reference</p>
          <p class="text-2xl font-mono font-bold text-brand-600">{{ booking.reference }}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-medium capitalize" :class="booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
          {{ booking.status }}
        </span>
      </div>

      <div class="border-t pt-4 space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">Total Paid</span>
          <span class="font-bold">{{ formatPrice(booking.total_amount, booking.currency) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Booked on</span>
          <span>{{ formatDate(booking.created_at) }}</span>
        </div>
      </div>

      <div v-if="booking.passengers?.length" class="mt-4 border-t pt-4">
        <h3 class="font-semibold text-gray-900 mb-3">Passengers</h3>
        <div class="space-y-2">
          <div v-for="p in booking.passengers" :key="p.id" class="flex items-center gap-2 text-sm">
            <span class="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{{ p.first_name?.[0] }}</span>
            <span class="text-gray-900">{{ p.first_name }} {{ p.last_name }}</span>
            <span class="text-gray-400 text-xs capitalize ml-auto">{{ p.type }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
