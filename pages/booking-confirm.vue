<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const { t, locale } = useI18n()
useSeo({ title: t('confirm.title'), description: t('confirm.seoDesc') })
useHead({ meta: [{ name: 'robots', content: 'noindex' }] })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('confirm.title'), url: '/booking-confirm' },
])

const bookingStore = useBookingStore()
const router = useRouter()

onMounted(async () => {
  // Restore from sessionStorage if store is empty (page refresh)
  if (!bookingStore.confirmedBooking) {
    try {
      const saved = sessionStorage.getItem('youfly_confirmed_booking')
      if (saved) {
        bookingStore.confirmedBooking = JSON.parse(saved)
        const savedOffer = sessionStorage.getItem('youfly_confirmed_offer')
        if (savedOffer) bookingStore.selectedOffer = JSON.parse(savedOffer)
        const savedPax = sessionStorage.getItem('youfly_confirmed_passengers')
        if (savedPax) bookingStore.passengers = JSON.parse(savedPax)
      }
    } catch {}
  }
  if (!bookingStore.confirmedBooking) return router.push('/my-booking')
  // Auto-save booking reference to localStorage for easy lookup later
  const ref = bookingStore.confirmedBooking.reference
  if (ref) {
    try {
      const existing = JSON.parse(localStorage.getItem('youfly_recent_refs') || '[]')
      const upper = ref.toUpperCase()
      const updated = [upper, ...existing.filter((r: string) => r !== upper)].slice(0, 5)
      localStorage.setItem('youfly_recent_refs', JSON.stringify(updated))
    } catch {}
  }
  // Auto-send confirmation email (best-effort, non-blocking)
  const leadEmail = bookingStore.passengers?.[0]?.email
  if (ref && leadEmail) {
    try {
      await $fetch('/api/send-confirmation', {
        method: 'POST',
        body: { reference: ref.toUpperCase(), email: leadEmail },
      })
    } catch {
      // Silent — email sending is best-effort
    }
  }
})

const { formatPrice, formatTime } = useFormatters()
const { formatWithMdl, showMdl } = useCurrency()
const booking = computed(() => bookingStore.confirmedBooking)
const offer = computed(() => bookingStore.selectedOffer)
const copied = ref(false)
const isPrinting = ref(false)

async function shareBooking() {
  if (!booking.value) return
  const text = `✈️ YouFly — ${booking.value.reference}\n${offer.value?.slices?.map((s: any) => `${s.origin?.iata_code} → ${s.destination?.iata_code}`).join(' / ') || ''}`
  if (navigator.share) {
    try { await navigator.share({ title: 'YouFly Booking', text, url: `${window.location.origin}/my-booking?ref=${booking.value.reference}` }) } catch {}
    return
  }
  try { await navigator.clipboard.writeText(text); copied.value = true; setTimeout(() => { copied.value = false }, 2000) } catch {}
}

async function copyRef() {
  if (!booking.value?.reference) return
  try {
    await navigator.clipboard.writeText(booking.value.reference)
    copied.value = true
    // Haptic feedback on mobile
    if (navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Clipboard API unavailable — silently ignore
  }
}

function printBoardingPass() {
  isPrinting.value = true
  setTimeout(() => {
    window.print()
    isPrinting.value = false
  }, 100)
}

function shortDateCompact(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <BookingSteps :current="4" />

    <!-- Destination scene hero -->
    <DestinationPhoto v-if="offer" :code="offer.slices?.[offer.slices.length - 1]?.destination?.iata_code || ''" :width="1200" height-class="relative no-print">
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent"></div>
      <div class="relative z-10 text-center py-10 px-4">
        <div class="w-20 h-20 bg-green-500/20 border-2 border-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-confirm-check">
          <svg class="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path class="animate-checkmark" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2 animate-confirm-text">{{ t('confirm.title') }}</h1>
        <p class="text-gray-400 animate-confirm-text" style="animation-delay: 0.15s">{{ t('confirm.subtitle') }}</p>
      </div>
    </DestinationPhoto>

    <div class="max-w-2xl mx-auto px-4 py-8">

      <!-- Boarding pass style card -->
      <div id="boarding-pass" class="boarding-pass bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-4">
        <!-- Header strip -->
        <div class="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span aria-hidden="true" class="text-2xl">✈</span>
            <span class="font-bold text-lg tracking-wider">YouFly</span>
          </div>
          <div class="text-right">
            <div class="text-xs opacity-75">{{ t('confirm.reference') }}</div>
            <div class="font-mono font-bold text-xl tracking-[0.25em]">{{ booking && booking.reference }}</div>
          </div>
        </div>

        <!-- Flight info -->
        <div v-if="offer" class="divide-y divide-dashed divide-gray-200">
          <div v-for="(slice, i) in offer.slices" :key="i" class="px-6 py-5">
            <div v-if="offer.slices.length > 1" class="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">
              {{ i === 0 ? t('flightCard.outbound') : t('flightCard.return') }}
            </div>
            <div class="flex items-center justify-between gap-4">
              <div class="text-center">
                <div class="text-3xl font-black text-gray-900">{{ slice.origin?.iata_code }}</div>
                <div class="text-sm text-gray-500 font-medium">{{ slice.origin?.city_name }}</div>
                <div class="text-lg font-bold text-gray-800 mt-1">{{ formatTime(slice.departing_at) }}</div>
                <div class="text-xs text-gray-400">{{ shortDateCompact(slice.departing_at) }}</div>
              </div>
              <div class="flex-1 text-center">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px border-t border-dashed border-gray-300"></div>
                  <span aria-hidden="true" class="text-xl text-gray-400">✈</span>
                  <div class="flex-1 h-px border-t border-dashed border-gray-300"></div>
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ slice.stops === 0 ? t('flightCard.direct') : slice.stops + ' ' + t('confirm.stopsLabel') }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-black text-gray-900">{{ slice.destination?.iata_code }}</div>
                <div class="text-sm text-gray-500 font-medium">{{ slice.destination?.city_name }}</div>
                <div class="text-lg font-bold text-gray-800 mt-1">{{ formatTime(slice.arriving_at) }}</div>
                <div class="text-xs text-gray-400">{{ shortDateCompact(slice.arriving_at) }}</div>
              </div>
            </div>
            <!-- Flight numbers -->
            <div class="mt-3 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <span>{{ (slice.segments || []).map((s: any) => s.carrier_name).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ') }}</span>
              <span v-if="(slice.segments || []).some((s: any) => s.flight_number)" class="font-mono bg-gray-100 px-2 py-0.5 rounded">
                {{ (slice.segments || []).map((s: any) => s.flight_number).filter(Boolean).join(' + ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tear line -->
        <div class="relative flex items-center px-6">
          <div class="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 -ml-8 shrink-0"></div>
          <div class="flex-1 border-t-2 border-dashed border-gray-200 mx-2"></div>
          <div class="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 -mr-8 shrink-0"></div>
        </div>

        <!-- Passengers + payment row -->
        <div class="px-6 py-4 grid grid-cols-2 gap-4 bg-gray-50">
          <div>
            <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">{{ t('steps.passengers') }}</div>
            <div class="space-y-1">
              <div v-for="p in bookingStore.passengers" :key="p.duffelPassengerId"
                class="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {{ p.given_name }} {{ p.family_name }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400 uppercase tracking-wider mb-2">{{ t('confirm.totalPaid') }}</div>
            <div class="text-2xl font-black text-brand-600">
              {{ booking ? formatWithMdl(booking.totalAmount, booking.currency) : '' }}
            </div>
            <div v-if="showMdl && booking" class="text-xs text-gray-400">≈ {{ formatPrice(booking.totalAmount, booking.currency) }}</div>
            <div v-if="booking?.duffelOrderId" class="text-xs text-gray-400 mt-1 font-mono">{{ booking.duffelOrderId.substring(0, 20) }}...</div>
          </div>
          <!-- Decorative barcode (deterministic pattern to avoid hydration mismatch) -->
          <div aria-hidden="true" class="px-6 py-3 flex items-center justify-center gap-[1px]">
            <div v-for="i in 40" :key="i" class="bg-gray-800 rounded-sm" :style="`width: ${i % 3 === 0 ? 2 : 1}px; height: ${16 + (i * 7 % 12)}px`"></div>
          </div>
        </div>
      </div>

      <!-- Copy ref -->
      <div class="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 flex items-center gap-3">
        <span aria-hidden="true" class="text-brand-600 text-xl">🎫</span>
        <div class="flex-1">
          <div class="text-sm text-gray-500 mb-1">{{ t('confirm.saveHint') }}</div>
          <div class="font-mono font-bold text-brand-700 text-xl tracking-widest">{{ booking && booking.reference }}</div>
        </div>
        <button @click="copyRef"
          :aria-label="copied ? t('confirm.copied') : t('confirm.copy')"
          class="px-4 py-2 border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors font-medium text-sm whitespace-nowrap">
          <span v-if="copied" aria-hidden="true">✓ </span>{{ copied ? t('confirm.copied') : t('confirm.copy') }}
        </button>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
        <button @click="shareBooking"
          class="py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-brand-300 transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          {{ t('confirm.shareBooking') }}
        </button>
        <button @click="printBoardingPass"
          class="py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-brand-300 transition-all flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          {{ t('confirm.printSave') }}
        </button>
        <NuxtLink :to="'/my-booking?ref=' + (booking && booking.reference)"
          class="py-3 border border-gray-300 rounded-xl text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {{ t('confirm.viewBooking') }}
        </NuxtLink>
        <NuxtLink to="/"
          class="py-3 bg-brand-600 hover:bg-brand-700 rounded-xl text-center text-sm font-medium text-white transition-colors">
          {{ t('confirm.bookAnother') }}
        </NuxtLink>
      </div>

      <!-- Post-booking upsells (inspired by zbor.md) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 no-print mt-4">
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 hover:border-brand-300 transition-all card-premium">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 text-sm">{{ t('confirm.transferTitle') }}</h4>
            <p class="text-xs text-gray-500 mt-0.5">{{ t('confirm.transferDesc') }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 hover:border-brand-300 transition-all card-premium">
          <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 text-sm">{{ t('confirm.hotelTitle') }}</h4>
            <p class="text-xs text-gray-500 mt-0.5">{{ t('confirm.hotelDesc') }}</p>
          </div>
        </div>
        <NuxtLink to="/checkin" class="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 hover:border-brand-300 transition-all card-premium">
          <div class="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 text-sm">{{ t('confirm.checkinTitle') }}</h4>
            <p class="text-xs text-gray-500 mt-0.5">{{ t('confirm.checkinDesc') }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes confirmCheck {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes confirmText {
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.animate-confirm-check { animation: confirmCheck 0.5s ease forwards; }
.animate-confirm-text { animation: confirmText 0.4s ease forwards; animation-delay: 0.3s; opacity: 0; }

@media print {
  .no-print { display: none !important; }
  header, footer, nav { display: none !important; }
  body { background: white; }
  #boarding-pass {
    border: 2px solid #1a56db !important;
    box-shadow: none !important;
    margin: 0;
    max-width: 100%;
  }
}
</style>
