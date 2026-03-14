<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t, locale } = useI18n()
useSeo({ title: t('deals.title'), description: t('deals.seoDesc') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('nav.deals'), url: '/deals' },
])

const searchStore = useSearchStore()
const router = useRouter()

const deals = computed(() => [
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'BCN', toCity: t('index.city_BCN'),
    flag: '🇪🇸',
    price: '31',
    originalPrice: '95',
    discount: '67',
    validUntil: '2026-03-31',
    tags: [t('deals.deal1Tag1'), t('deals.deal1Tag2')],
    description: t('deals.deal1Desc')
  },
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'IST', toCity: t('index.city_IST'),
    flag: '🇹🇷',
    price: '32',
    originalPrice: '78',
    discount: '59',
    validUntil: '2026-04-15',
    tags: [t('deals.deal2Tag1'), t('deals.deal2Tag2')],
    description: t('deals.deal2Desc')
  },
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'LTN', toCity: t('index.city_LTN'),
    flag: '🇬🇧',
    price: '39',
    originalPrice: '120',
    discount: '68',
    validUntil: '2026-03-25',
    tags: [t('deals.deal3Tag1'), t('deals.deal3Tag2')],
    description: t('deals.deal3Desc')
  },
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'VIE', toCity: t('index.city_VIE'),
    flag: '🇦🇹',
    price: '39',
    originalPrice: '95',
    discount: '59',
    validUntil: '2026-04-30',
    tags: [t('deals.deal4Tag1')],
    description: t('deals.deal4Desc')
  },
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'CDG', toCity: t('index.city_CDG'),
    flag: '🇫🇷',
    price: '73',
    originalPrice: '185',
    discount: '61',
    validUntil: '2026-05-15',
    tags: [t('deals.deal5Tag1')],
    description: t('deals.deal5Desc')
  },
  {
    from: 'RMO', fromCity: t('airports.city_RMO'),
    to: 'TLV', toCity: t('index.city_TLV'),
    flag: '🇮🇱',
    price: '45',
    originalPrice: '110',
    discount: '59',
    validUntil: '2026-04-20',
    tags: [t('deals.deal6Tag1')],
    description: t('deals.deal6Desc')
  },
])

const searchingDeal = ref<string | null>(null)

// Flash sale countdown — resets daily at midnight
const flashCountdown = ref('')
function updateFlash() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  flashCountdown.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
let flashInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => { updateFlash(); flashInterval = setInterval(updateFlash, 1000) })
onUnmounted(() => { if (flashInterval) clearInterval(flashInterval) })

async function bookDeal(deal: (typeof deals.value)[0]) {
  searchingDeal.value = deal.to
  searchStore.origin = { iata_code: 'MD', airport_iata: deal.from, name: deal.fromCity + ' Airport', city_name: deal.fromCity, country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: deal.to, name: deal.toCity + ' Airport', city_name: deal.toCity, country_code: '' }
  const nextMonth = new Date()
  nextMonth.setDate(nextMonth.getDate() + 14)
  searchStore.departureDate = nextMonth.toISOString().split('T')[0]
  searchStore.tripType = 'oneway'
  try {
    const ok = await searchStore.submitSearch()
    if (ok) router.push('/search')
  } finally {
    searchingDeal.value = null
  }
}
</script>

<template>
  <div>
    <!-- Flash sale banner -->
    <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 text-center">
      <div class="flex items-center justify-center gap-3 flex-wrap text-sm font-semibold">
        <span><span aria-hidden="true">🔥</span> {{ t('deals.flashSale') }} — {{ t('deals.title') }}!</span>
        <span aria-hidden="true" class="bg-white/20 px-3 py-1 rounded-full font-mono text-lg tracking-widest">{{ flashCountdown }}</span>
        <span class="text-red-200 text-xs">{{ t('deals.flashSaleEnds') }}</span>
      </div>
    </div>

  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="text-center mb-10">
      <div aria-hidden="true" class="text-4xl mb-3">🔥</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('deals.title') }}</h1>
      <p class="text-gray-500">{{ t('deals.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="deal in deals" :key="deal.to"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
        <!-- Deal header -->
        <div class="bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white relative">
          <div class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            :aria-label="t('deals.discountLabel', { n: deal.discount })">
            <span aria-hidden="true">-{{ deal.discount }}%</span>
          </div>
          <div aria-hidden="true" class="text-3xl mb-2">{{ deal.flag }}</div>
          <div class="text-xl font-bold">{{ deal.fromCity }} <span aria-hidden="true">→</span> {{ deal.toCity }}</div>
          <div class="text-brand-200 text-sm mt-1">{{ deal.from }} — {{ deal.to }}</div>
        </div>

        <!-- Deal body -->
        <div class="p-5">
          <!-- Tags -->
          <div class="flex gap-2 mb-3 flex-wrap">
            <span v-for="tag in deal.tags" :key="tag"
              class="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-medium">{{ tag }}</span>
          </div>

          <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ deal.description }}</p>

          <!-- Price -->
          <div class="flex items-baseline gap-2 mb-1">
            <span class="text-3xl font-black text-brand-600">€{{ deal.price }}</span>
            <span class="text-gray-400 line-through text-sm" :aria-label="t('deals.originalPriceLabel', { price: deal.originalPrice })">€{{ deal.originalPrice }}</span>
            <span class="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{{ t('deals.save') }}{{ parseInt(deal.originalPrice) - parseInt(deal.price) }}</span>
          </div>
          <p class="text-xs text-gray-400 mb-4">{{ t('deals.perPerson') }} · {{ t('deals.flashSaleEnds') }} {{ new Date(deal.validUntil).toLocaleDateString(locale.value, {day: 'numeric', month: 'long'}) }}</p>

          <button @click="bookDeal(deal)" :disabled="searchingDeal !== null"
            :aria-label="t('deals.bookBtnLabel', { from: deal.fromCity, to: deal.toCity, price: deal.price })"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <div v-if="searchingDeal === deal.to" role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span v-else>{{ t('deals.bookNow') }} <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <div aria-hidden="true" class="text-2xl mb-2">⚠️</div>
      <p class="text-amber-800 font-medium mb-1">{{ t('deals.priceNote') }}</p>
      <p class="text-amber-700 text-sm">{{ t('deals.priceNoteSub') }}</p>
    </div>
  </div>
  </div>
</template>
