<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const { t } = useI18n()
useHead({ title: computed(() => `${t('passengers.title')} — YouFly`), meta: [{ name: 'robots', content: 'noindex' }] })

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
    // Try to restore saved passenger data
    let savedForms: any[] | null = null
    try {
      const saved = sessionStorage.getItem('youfly_passenger_forms')
      if (saved) savedForms = JSON.parse(saved)
    } catch {}

    // Try to recall last used email/phone for lead passenger
    let lastEmail = ''
    let lastPhone = ''
    try {
      lastEmail = localStorage.getItem('youfly_last_email') || ''
      lastPhone = localStorage.getItem('youfly_last_phone') || ''
    } catch {}

    passengerForms.value = offerPassengers.map((p: any, i: number) => {
      const restored = savedForms?.find((s: any) => s.duffelPassengerId === p.id)
      return restored || {
        duffelPassengerId: p.id,
        type: p.type || 'adult',
        title: 'mr',
        given_name: '',
        family_name: '',
        born_on: '',
        email: i === 0 ? lastEmail : undefined,
        phone: i === 0 ? lastPhone : undefined,
        gender: 'm',
        passport_number: '',
        passport_country: 'MD',
        passport_expires: '',
      }
    })
  } catch (e: any) {
    offerError.value = t('passengers.loadError')
  } finally {
    isLoading.value = false
  }
})

const emailRe = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
const hasAgeError = ref(false)

/** Age in full years at the departure date */
function ageAtDeparture(bornOn: string): number | null {
  const depIso = bookingStore.selectedOffer?.slices?.[0]?.departing_at
  if (!bornOn || !depIso) return null
  const dob = new Date(bornOn)
  const dep = new Date(depIso)
  if (isNaN(dob.getTime()) || isNaN(dep.getTime())) return null
  let age = dep.getFullYear() - dob.getFullYear()
  const beforeBirthday = dep.getMonth() < dob.getMonth() ||
    (dep.getMonth() === dob.getMonth() && dep.getDate() < dob.getDate())
  if (beforeBirthday) age--
  return age
}

/** Duffel passenger types: infant_without_seat < 2, child 2–17, adult 18+ */
function ageMatchesType(type: string, age: number): boolean {
  if (type === 'infant_without_seat') return age >= 0 && age < 2
  if (type === 'child') return age >= 2 && age < 18
  return age >= 18
}

function validate(): boolean {
  errors.value = {}
  hasAgeError.value = false
  passengerForms.value.forEach((p, i) => {
    if (!p.given_name?.trim()) errors.value[`${i}_given_name`] = '!'
    else if (p.given_name.trim().length > 100) errors.value[`${i}_given_name`] = '!'
    if (!p.family_name?.trim()) errors.value[`${i}_family_name`] = '!'
    else if (p.family_name.trim().length > 100) errors.value[`${i}_family_name`] = '!'
    if (!p.born_on) errors.value[`${i}_born_on`] = '!'
    else {
      const age = ageAtDeparture(p.born_on)
      if (age !== null && !ageMatchesType(p.type, age)) {
        errors.value[`${i}_born_on`] = '!'
        hasAgeError.value = true
      }
    }
    if (i === 0) {
      if (!p.email?.trim()) errors.value[`${i}_email`] = '!'
      else if (!emailRe.test(p.email.trim())) errors.value[`${i}_email`] = '!'
      if (!p.phone?.trim()) errors.value[`${i}_phone`] = '!'
      else if (p.phone.replace(/\D/g, '').length < 7) errors.value[`${i}_phone`] = '!'
    }
  })
  return Object.keys(errors.value).length === 0
}

// Auto-save passenger forms to sessionStorage on changes
watch(passengerForms, (val) => {
  try { sessionStorage.setItem('youfly_passenger_forms', JSON.stringify(val)) } catch {}
}, { deep: true })

function onSubmit() {
  if (!validate()) return
  // Remember email/phone for next booking
  const lead = passengerForms.value[0]
  if (lead?.email) try { localStorage.setItem('youfly_last_email', lead.email.trim()) } catch {}
  if (lead?.phone) try { localStorage.setItem('youfly_last_phone', lead.phone.trim()) } catch {}
  bookingStore.setPassengers(passengerForms.value)
  router.push('/seat-selection')
}

const { formatPrice, formatTime, stopsLabel } = useFormatters()

const expiresAt = computed(() => fullOffer.value?.expires_at || null)
const { formatted: countdownFormatted, isExpiringSoon, isExpired } = useCountdown(expiresAt)
const today = new Date().toISOString().split('T')[0]

const passportCountries = [
  { code: 'MD', flag: '🇲🇩', name: 'Moldova' },
  { code: 'RO', flag: '🇷🇴', name: 'România' },
  { code: 'UA', flag: '🇺🇦', name: 'Ukraina' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: 'TR', flag: '🇹🇷', name: 'Türkiye' },
  { code: 'DE', flag: '🇩🇪', name: 'Deutschland' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'IT', flag: '🇮🇹', name: 'Italia' },
  { code: 'ES', flag: '🇪🇸', name: 'España' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: 'GE', flag: '🇬🇪', name: 'Georgia' },
  { code: 'PL', flag: '🇵🇱', name: 'Polska' },
  { code: 'AT', flag: '🇦🇹', name: 'Österreich' },
  { code: 'BG', flag: '🇧🇬', name: 'Bulgaria' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  { code: 'CZ', flag: '🇨🇿', name: 'Česko' },
  { code: 'HU', flag: '🇭🇺', name: 'Magyarország' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
]

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

    <div v-if="isLoading" role="status" :aria-label="t('common.loading')" class="flex justify-center py-20">
      <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="offerError" role="alert" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-red-600 font-medium mb-4">{{ offerError }}</p>
      <button @click="router.push('/')" class="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">{{ t('passengers.searchAgain') }}</button>
    </div>

    <!-- Expiry countdown banner -->
    <div v-if="fullOffer && !offerError"
      class="mb-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border"
      :class="isExpired ? 'bg-red-50 border-red-200 text-red-700' :
              isExpiringSoon ? 'bg-orange-50 border-orange-200 text-orange-700' :
              'bg-brand-50 border-brand-100 text-brand-700'">
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span v-if="isExpired">{{ t('ticketOrder.expired') }}</span>
      <span v-else-if="isExpiringSoon">{{ t('ticketOrder.expiringSoon', { time: countdownFormatted }) }}</span>
      <span v-else>{{ t('ticketOrder.reserved', { time: countdownFormatted }) }}</span>
    </div>

    <form v-if="fullOffer && !offerError" class="grid grid-cols-1 lg:grid-cols-3 gap-6" @submit.prevent="onSubmit" novalidate>
      <!-- Forms -->
      <div class="lg:col-span-2 space-y-5">
        <div v-for="(passenger, i) in passengerForms" :key="i" role="group" :aria-labelledby="`pax-heading-${i}`" class="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 :id="`pax-heading-${i}`" class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {{ typeLabel(passenger.type) }} {{ i + 1 }}
            <span v-if="i === 0" class="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{{ t('passengers.leadPassenger') }}</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label :for="`pax-${i}-title`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.title_label') }}</label>
              <select :id="`pax-${i}-title`" v-model="passenger.title" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="mr">{{ t('passengers.title_mr') }}</option>
                <option value="ms">{{ t('passengers.title_ms') }}</option>
                <option value="mrs">{{ t('passengers.title_mrs') }}</option>
                <option value="dr">{{ t('passengers.title_dr') }}</option>
              </select>
            </div>
            <div>
              <label :for="`pax-${i}-gender`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.gender') }}</label>
              <select :id="`pax-${i}-gender`" v-model="passenger.gender" class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="m">{{ t('passengers.male') }}</option>
                <option value="f">{{ t('passengers.female') }}</option>
              </select>
            </div>
            <div>
              <label :for="`pax-${i}-given-name`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.firstName') }}</label>
              <input :id="`pax-${i}-given-name`" v-model="passenger.given_name" type="text" :placeholder="t('passengers.firstNamePlaceholder')"
                :aria-invalid="!!errors[`${i}_given_name`]"
                required maxlength="100"
                :autocomplete="i === 0 ? 'given-name' : 'off'"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_given_name`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <div>
              <label :for="`pax-${i}-family-name`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.lastName') }}</label>
              <input :id="`pax-${i}-family-name`" v-model="passenger.family_name" type="text" :placeholder="t('passengers.lastNamePlaceholder')"
                :aria-invalid="!!errors[`${i}_family_name`]"
                required maxlength="100"
                :autocomplete="i === 0 ? 'family-name' : 'off'"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_family_name`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <div>
              <label :for="`pax-${i}-born-on`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.dob') }}</label>
              <input :id="`pax-${i}-born-on`" v-model="passenger.born_on" type="date"
                :aria-invalid="!!errors[`${i}_born_on`]"
                required
                :max="today"
                autocomplete="bday"
                class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                :class="errors[`${i}_born_on`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
            </div>
            <template v-if="i === 0">
              <div>
                <label :for="`pax-${i}-email`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.email') }}</label>
                <input :id="`pax-${i}-email`" v-model="passenger.email" type="email" :placeholder="t('passengers.emailPlaceholder')"
                  :aria-invalid="!!errors[`${i}_email`]"
                  required
                  autocomplete="email"
                  class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  :class="errors[`${i}_email`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              </div>
              <div>
                <label :for="`pax-${i}-phone`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.phone') }}</label>
                <input :id="`pax-${i}-phone`" v-model="passenger.phone" type="tel" :placeholder="t('passengers.phonePlaceholder')"
                  :aria-invalid="!!errors[`${i}_phone`]"
                  required
                  autocomplete="tel"
                  class="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  :class="errors[`${i}_phone`] ? 'border-red-400 bg-red-50' : 'border-gray-300'" />
              </div>
            </template>
            <div>
              <label :for="`pax-${i}-passport`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.passport') }}</label>
              <input :id="`pax-${i}-passport`" v-model="passenger.passport_number" type="text" :placeholder="t('passengers.passportPlaceholder')"
                autocapitalize="characters" maxlength="20"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono tracking-wider" />
            </div>
            <div>
              <label :for="`pax-${i}-passport-country`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.passportCountry') }}</label>
              <select :id="`pax-${i}-passport-country`" v-model="passenger.passport_country"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option v-for="c in passportCountries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
              </select>
            </div>
            <div>
              <label :for="`pax-${i}-passport-expires`" class="block text-sm font-medium text-gray-700 mb-1">{{ t('passengers.passportExpiry') }}</label>
              <input :id="`pax-${i}-passport-expires`" v-model="passenger.passport_expires" type="date"
                :min="today"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </div>

        <div v-if="Object.keys(errors).length" role="alert" class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
          {{ t('passengers.requiredFields') }}
          <span v-if="hasAgeError" class="block mt-1">{{ t('passengers.ageInvalid') }}</span>
        </div>

        <!-- Travel insurance promo -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-900 text-sm mb-1">{{ t('passengers.insuranceTitle') }}</p>
            <p class="text-xs text-gray-500 leading-relaxed">{{ t('passengers.insuranceDesc') }}</p>
          </div>
        </div>

        <button type="submit"
          class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-lg glow-cta">
          {{ t('passengers.continue') }}
        </button>
      </div>

      <!-- Order summary sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
          <!-- Destination photo header -->
          <DestinationPhoto v-if="bookingStore.selectedOffer" :code="bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code || ''" height-class="h-28">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-3 left-4 right-4 text-white">
              <div class="text-xs font-medium opacity-80">{{ t('passengers.yourFlight') }}</div>
              <div class="font-black text-lg">
                {{ bookingStore.selectedOffer.slices?.[0]?.origin?.iata_code }}
                <span class="mx-1 opacity-60">→</span>
                {{ bookingStore.selectedOffer.slices?.[bookingStore.selectedOffer.slices.length - 1]?.destination?.iata_code }}
              </div>
            </div>
          </DestinationPhoto>
          <div class="p-5">
          <div v-if="bookingStore.selectedOffer" class="space-y-4">
            <div v-for="(slice, i) in bookingStore.selectedOffer.slices" :key="i" class="text-sm">
              <div class="font-semibold text-gray-800">
                {{ slice.origin?.iata_code }} <span aria-hidden="true">→</span> {{ slice.destination?.iata_code }}
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
              <!-- Departure countdown -->
              <div v-if="bookingStore.selectedOffer.slices?.[0]?.departing_at" class="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span class="text-gray-500">
                  {{ t('passengers.departsIn') }}
                  <span class="font-semibold text-gray-700">{{ Math.max(0, Math.ceil((new Date(bookingStore.selectedOffer.slices[0].departing_at).getTime() - Date.now()) / 86400000)) }}</span>
                  {{ t('passengers.daysLabel') }}
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  </div>
</template>
