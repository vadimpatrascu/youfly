<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import { useSearchStore } from '~/stores/search'

useHead({ title: 'Passenger Details — YouFly' })

const bookingStore = useBookingStore()
const searchStore = useSearchStore()
const router = useRouter()

const fullOffer = ref<any>(null)
const isLoading = ref(true)
const offerError = ref('')

onMounted(async () => {
  if (!bookingStore.selectedOffer) return router.push('/')
  try {
    fullOffer.value = await $fetch<any>(`/api/offer/${bookingStore.selectedOffer.id}`)
    // Check expiry
    if (new Date(fullOffer.value.expires_at) < new Date()) {
      offerError.value = 'This offer has expired. Please search again.'
      return
    }
    // Init passenger forms from Duffel offer passenger IDs
    const offerPassengers = fullOffer.value.passengers || bookingStore.selectedOffer.passengers || []
    passengerForms.value = offerPassengers.map((p: any, i: number) => ({
      duffelPassengerId: p.id,
      type: p.type || 'adult',
      title: 'mr',
      given_name: '',
      family_name: '',
      born_on: '',
      email: i === 0 ? '' : undefined,
      phone: i === 0 ? '' : undefined,
      gender: 'm',
      passport_number: '',
      passport_country: 'MD',
      passport_expires: '',
    }))
  } catch (e: any) {
    offerError.value = 'Failed to load offer details.'
  } finally {
    isLoading.value = false
  }
})

const passengerForms = ref<any[]>([])
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  passengerForms.value.forEach((p, i) => {
    if (!p.given_name?.trim()) errors.value[`${i}_given_name`] = 'First name required'
    if (!p.family_name?.trim()) errors.value[`${i}_family_name`] = 'Last name required'
    if (!p.born_on) errors.value[`${i}_born_on`] = 'Date of birth required'
    if (i === 0 && !p.email?.trim()) errors.value[`${i}_email`] = 'Email required'
    if (i === 0 && !p.phone?.trim()) errors.value[`${i}_phone`] = 'Phone required'
  })
  return Object.keys(errors.value).length === 0
}

function onSubmit() {
  if (!validate()) return
  bookingStore.setPassengers(passengerForms.value)
  router.push('/payment')
}

const { formatPrice, formatTime, formatDate, stopsLabel } = useFormatters()
const typeLabel = (t: string) => ({ adult: 'Adult', child: 'Child', infant_without_seat: 'Infant' } as Record<string, string>)[t] || 'Passenger'
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex items-center gap-3 mb-8">
      <button @click="router.back()" class="text-gray-500 hover:text-gray-700">← Back</button>
      <h1 class="text-2xl font-bold text-gray-900">Passenger Details</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="offerError" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p class="text-red-600 font-medium">{{ offerError }}</p>
      <button @click="router.push('/')" class="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl">Search Again</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Passenger Forms -->
      <div class="lg:col-span-2 space-y-6">
        <div v-for="(passenger, i) in passengerForms" :key="i" class="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">
            {{ typeLabel(passenger.type) }} {{ i + 1 }}
            <span v-if="i === 0" class="ml-2 text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Lead passenger</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <select v-model="passenger.title" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="mr">Mr</option>
                <option value="ms">Ms</option>
                <option value="mrs">Mrs</option>
                <option value="dr">Dr</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select v-model="passenger.gender" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="passenger.given_name" type="text" placeholder="As on passport" class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" :class="errors[`${i}_given_name`] ? 'border-red-400' : 'border-gray-300'" />
              <p v-if="errors[`${i}_given_name`]" class="text-red-500 text-xs mt-1">{{ errors[`${i}_given_name`] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="passenger.family_name" type="text" placeholder="As on passport" class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" :class="errors[`${i}_family_name`] ? 'border-red-400' : 'border-gray-300'" />
              <p v-if="errors[`${i}_family_name`]" class="text-red-500 text-xs mt-1">{{ errors[`${i}_family_name`] }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input v-model="passenger.born_on" type="date" class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" :class="errors[`${i}_born_on`] ? 'border-red-400' : 'border-gray-300'" />
              <p v-if="errors[`${i}_born_on`]" class="text-red-500 text-xs mt-1">{{ errors[`${i}_born_on`] }}</p>
            </div>
            <template v-if="i === 0">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input v-model="passenger.email" type="email" placeholder="Booking confirmation" class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" :class="errors[`${i}_email`] ? 'border-red-400' : 'border-gray-300'" />
                <p v-if="errors[`${i}_email`]" class="text-red-500 text-xs mt-1">{{ errors[`${i}_email`] }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input v-model="passenger.phone" type="tel" placeholder="+373 60 000 000" class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" :class="errors[`${i}_phone`] ? 'border-red-400' : 'border-gray-300'" />
                <p v-if="errors[`${i}_phone`]" class="text-red-500 text-xs mt-1">{{ errors[`${i}_phone`] }}</p>
              </div>
            </template>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input v-model="passenger.passport_number" type="text" placeholder="Optional" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
              <input v-model="passenger.passport_expires" type="date" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>
        <button @click="onSubmit" class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors">
          Continue to Payment →
        </button>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
          <h3 class="font-semibold text-gray-900 mb-4">Your Flight</h3>
          <div v-if="bookingStore.selectedOffer" class="space-y-3">
            <div v-for="slice in bookingStore.selectedOffer.slices" :key="slice.id" class="text-sm">
              <div class="font-medium text-gray-900">{{ slice.origin.iata_code }} → {{ slice.destination.iata_code }}</div>
              <div class="text-gray-500">{{ formatTime(slice.departing_at) }} – {{ formatTime(slice.arriving_at) }}</div>
              <div class="text-xs text-gray-400">{{ stopsLabel(slice.stops) }}</div>
            </div>
            <div class="pt-3 border-t mt-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total</span>
                <span class="text-xl font-bold text-brand-600">{{ formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">Includes all taxes and fees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
