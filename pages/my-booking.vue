<script setup lang="ts">
const { t, locale } = useI18n()
useSeo({ title: t('myBooking.title'), description: t('myBooking.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('myBooking.title'), url: '/my-booking' },
])

const route = useRoute()
const refInput = ref((route.query.ref as string) || '')
const booking = ref<any>(null)
const isLoading = ref(false)
const error = ref('')
const { formatPrice, formatDate, formatTime } = useFormatters()

function printPage() {
  if (typeof window !== 'undefined') window.print()
}

function passengerTypeLabel(type: string) {
  if (type === 'adult') return t('passengers.adult')
  if (type === 'child') return t('passengers.child')
  if (type === 'infant_without_seat') return t('passengers.infant')
  return type
}

// Remember successful booking lookups in localStorage
const recentRefs = ref<string[]>([])

onMounted(() => {
  try {
    recentRefs.value = JSON.parse(localStorage.getItem('youfly_recent_refs') || '[]')
  } catch { recentRefs.value = [] }
})

function saveRef(ref: string) {
  const upper = ref.toUpperCase()
  const updated = [upper, ...recentRefs.value.filter(r => r !== upper)].slice(0, 5)
  recentRefs.value = updated
  try { localStorage.setItem('youfly_recent_refs', JSON.stringify(updated)) } catch {}
}

async function lookup() {
  if (!refInput.value.trim()) return
  isLoading.value = true
  error.value = ''
  booking.value = null
  try {
    booking.value = await $fetch<any>('/api/booking/' + refInput.value.trim().toUpperCase())
    saveRef(refInput.value.trim())
  } catch (e: any) {
    error.value = e?.data?.message === 'Booking not found' ? t('myBooking.notFound') : t('myBooking.error')
  } finally {
    isLoading.value = false
  }
}

function lookupRef(ref: string) {
  refInput.value = ref
  lookup()
}

function shortDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

if (route.query.ref) lookup()
</script>

<template>
  <div>
    <div class="bg-gray-950 text-white py-14 px-4 text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" aria-hidden="true">
        <svg viewBox="0 0 1200 300" class="w-full h-full" preserveAspectRatio="none">
          <path d="M-50,200 Q300,50 600,150 Q900,250 1250,50" fill="none" stroke="white" stroke-width="1" class="flight-path"/>
        </svg>
      </div>
      <div class="relative z-10">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        </div>
        <h1 class="text-3xl font-black mb-2">{{ t('myBooking.title') }}</h1>
        <p class="text-gray-400">{{ t('myBooking.subtitle') }}</p>
      </div>
    </div>
  <div class="max-w-2xl mx-auto px-4 py-12">

    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex gap-3">
        <input v-model="refInput" type="text" :placeholder="t('myBooking.placeholder')"
          :aria-label="t('myBooking.placeholder')" autocapitalize="characters" autocomplete="off" spellcheck="false"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase tracking-widest text-center text-xl"
          @keyup.enter="lookup" maxlength="10" />
        <button @click="lookup" :disabled="isLoading || !refInput.trim()"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors min-w-[100px]">
          <span v-if="isLoading" class="flex justify-center">
            <div role="status" :aria-label="t('common.loading')" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          <span v-else>{{ t('myBooking.search') }}</span>
        </button>
      </div>
      <p v-if="error" role="alert" class="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-xl text-center">{{ error }}</p>

      <!-- Recent booking references -->
      <div v-if="recentRefs.length && !booking" class="mt-4 flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400 shrink-0">{{ t('index.recentSearches').replace(':', '') }}:</span>
        <button v-for="ref in recentRefs" :key="ref" @click="lookupRef(ref)"
          class="px-3 py-1 text-xs font-mono font-bold border border-gray-200 rounded-full hover:border-brand-400 text-gray-600 tracking-widest transition-colors">
          {{ ref }}
        </button>
      </div>
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
            <template v-if="booking.status === 'confirmed'"><span aria-hidden="true">✓ </span>{{ t('myBooking.confirmed') }}</template>
            <template v-else-if="booking.status === 'cancelled'">{{ t('myBooking.cancelled') }}</template>
            <template v-else>{{ t('myBooking.pending') }}</template>
          </span>
        </div>

        <!-- Flight from raw_offer -->
        <div v-if="booking.raw_offer && booking.raw_offer.slices" class="space-y-3 mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">{{ t('myBooking.flightBooked') }}</h3>
          <div v-for="(slice, i) in booking.raw_offer.slices" :key="i"
            class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold text-gray-900">{{ formatTime(slice.departing_at) }}</div>
                <div class="text-sm font-medium text-gray-700">{{ slice.origin && slice.origin.iata_code }}</div>
                <div class="text-xs text-gray-400">{{ shortDate(slice.departing_at) }}</div>
              </div>
              <div aria-hidden="true" class="text-2xl text-gray-300">&#9992;</div>
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
            <span class="text-gray-400 text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{{ passengerTypeLabel(pp.type) }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button @click="printPage" class="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <svg aria-hidden="true" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          {{ t('myBooking.print') }}
        </button>
        <NuxtLink to="/" class="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center">
          {{ t('myBooking.searchAnother') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Help section when no booking loaded -->
    <div v-if="!booking && !isLoading" class="mt-8 bg-gray-50 rounded-2xl border border-gray-200 p-6">
      <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span aria-hidden="true" class="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
          <svg class="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a7 7 0 00-3.5 13.06V17a1 1 0 001 1h5a1 1 0 001-1v-1.94A7 7 0 0012 2zm1 14h-2v-1h2v1zm0-3h-2V9h2v4z"/></svg>
        </span>
        {{ t('myBooking.needHelp') }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <NuxtLink to="/faq" class="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 hover:border-brand-400 transition-colors">
          <svg aria-hidden="true" class="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="text-gray-700">FAQ</span>
        </NuxtLink>
        <NuxtLink to="/contact" class="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 hover:border-brand-400 transition-colors">
          <svg aria-hidden="true" class="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span class="text-gray-700">{{ t('nav.contact') }}</span>
        </NuxtLink>
        <a href="tel:+37322000000" class="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 hover:border-brand-400 transition-colors">
          <svg aria-hidden="true" class="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          <span class="text-gray-700">+373 22 000 000</span>
        </a>
      </div>
    </div>
  </div>
  </div>
</template>
