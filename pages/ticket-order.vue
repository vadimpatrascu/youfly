<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const { t } = useI18n()
useHead({ title: computed(() => `${t('passengers.title')} — YouFly`) })

const bookingStore = useBookingStore()
const router = useRouter()

const fullOffer = ref<any>(null)
const isLoading = ref(true)
const offerError = ref('')
const passengerForms = ref<any[]>([])
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  if (!bookingStore.selectedOffer) return router.push('/')
  try {
    fullOffer.value = await $fetch<any>(`/api/offer/${bookingStore.selectedOffer.id}`)
    if (new Date(fullOffer.value.expires_at) < new Date()) {
      offerError.value = t('passengers.offerExpired')
      return
    }
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
    offerError.value = t('passengers.loadError')
  } finally {
    isLoading.value = false
  }
})

function validate(): boolean {
  errors.value = {}
  passengerForms.value.forEach((p, i) => {
    if (!p.given_name?.trim()) errors.value[`${i}_given_name`] = '!'
    if (!p.family_name?.trim()) errors.value[`${i}_family_name`] = '!'
    if (!p.born_on) errors.value[`${i}_born_on`] = '!'
    if (i === 0 && !p.email?.trim()) errors.value[`${i}_email`] = '!'
    if (i === 0 && !p.phone?.trim()) errors.value[`${i}_phone`] = '!'
  })
  return Object.keys(errors.value).length === 0
}

function onSubmit() {
  if (!validate()) return
  bookingStore.setPassengers(passengerForms.value)
  router.push('/seat-selection')
}

const { formatPrice, formatTime, stopsLabel } = useFormatters()

const expiresAt = computed(() => fullOffer.value?.expires_at || null)
const { formatted: countdownFormatted, isExpiringSoon, isExpired } = useCountdown(expiresAt)

function typeLabel(type: string) {
  if (type === 'adult') return t('passengers.adult')
  if (type === 'child') return t('passengers.child')
  if (type === 'infant_without_seat') return t('passengers.infant')
  return t('passengers.adult')
}
</script>

<template>
  <div>
    <BookingSteps :current="1" />
    <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="text-gray-500 hover:text-gray-700 text-sm">{{ t('passengers.back') }}</button>
      <h1 class="text-2xl font-bold text-gray-900">{{ t('passengers.title') }}</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="offerError" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div class="text-5xl mb-4">⏱️</div>
      <p class="text-red-600 font-medium mb-4">{{ offerError }}</p>
      <button @click="router.push('/')" class="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium">{{ t('passengers.searchAgain') }}</button>
    </div>

    <!-- Expiry countdown banner -->
    <div v-if="fullOffer && !offerError"
      class="mb-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border"
      :class="isExpired ? 'bg-red-50 border-red-200 text-red-700' :
              isExpiringSoon ? 'bg-orange-50 border-orange-200 text-orange-700' :
              'bg-brand-50 border-brand-100 text-brand-700'">
      <span>&#9200;</span>
      <span v-if="isExpired">Oferta a expirat. Vă rugăm căutați din nou.</span>
      <span v-else-if="isExpiringSoon">Oferta expiră în <strong>{{ countdownFormatted }}</strong>! Completați rapid.</span>
      <span v-else>Oferta este rezervată pentru <strong>{{ countdownFormatted }}</strong></span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Forms -->
      <div class="lg:col-span-2 space-y-5">
        <div v-for="(passenger, i) in passengerForms" :key="i" class="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {{ typeLabel(passenger.type) }} {{ i + 1 }}
            <span v-if="i === 0" class="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{{ t('passengers.leadPassenger') }}</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titlu</label>
              <select v-model="passenger.title" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="mr">{{ t('passengers.title_mr') }}</option>
                <option value="ms">{{ t('passengers.title_ms') }}</option>
                <option value="mrs">{{ t('passengers.title_mrs') }}</option>
                <option value="dr">{{ t('passengers.title_dr') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.gender') }}</label>
              <select v-model="passenger.gender" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="m">{{ t('passengers.male') }}</option>
                <option value="f">{{ t('passengers.female') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.firstName') }}</label>
              <input v-model="passenger.given_name" type="text" :placeholder="t('passengers.firstNamePlaceholder')"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_given_name`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.lastName') }}</label>
              <input v-model="passenger.family_name" type="text" :placeholder="t('passengers.lastNamePlaceholder')"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_family_name`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.dob') }}</label>
              <input v-model="passenger.born_on" type="date"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_born_on`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <template v-if="i === 0">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.email') }}</label>
                <input v-model="passenger.email" type="email" :placeholder="t('passengers.emailPlaceholder')"
                  class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  :class="errors[`${i}_email`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.phone') }}</label>
                <input v-model="passenger.phone" type="tel" :placeholder="t('passengers.phonePlaceholder')"
                  class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  :class="errors[`${i}_phone`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              </div>
            </template>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.passport') }}</label>
              <input v-model="passenger.passport_number" type="text" :placeholder="t('passengers.passportPlaceholder')"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.passportExpiry') }}</label>
              <input v-model="passenger.passport_expires" type="date"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        <div v-if="Object.keys(errors).length" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          Vă rugăm completați toate câmpurile obligatorii (*).
        </div>

        <button @click="onSubmit"
          class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg">
          {{ t('passengers.continue') }}
        </button>
      </div>

      <!-- Order summary sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
          <h3 class="font-semibold text-gray-900 mb-4">{{ t('passengers.yourFlight') }}</h3>
          <div v-if="bookingStore.selectedOffer" class="space-y-4">
            <div v-for="(slice, i) in bookingStore.selectedOffer.slices" :key="i" class="text-sm">
              <div class="font-semibold text-gray-800">
                {{ slice.origin?.iata_code }} → {{ slice.destination?.iata_code }}
              </div>
              <div class="text-gray-500 mt-0.5">
                {{ formatTime(slice.departing_at) }} – {{ formatTime(slice.arriving_at) }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ stopsLabel(slice.stops) }}</div>
            </div>
            <div class="pt-3 border-t">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 text-sm">{{ t('passengers.total') }}</span>
                <span class="text-xl font-bold text-brand-600">{{ formatPrice(bookingStore.selectedOffer.total_amount, bookingStore.selectedOffer.total_currency) }}</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ t('passengers.taxesIncluded') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
