<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t, locale } = useI18n()
const { showMdl } = useCurrency()
useSeo({ title: t('deals.title'), description: t('deals.seoDesc') })
useReveal()
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('nav.deals'), url: '/deals' },
])

// Structured data for flight deals (OfferCatalog)
useStructuredData({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: t('deals.title'),
  description: t('deals.seoDesc'),
  numberOfItems: 6,
  itemListElement: [
    { '@type': 'Offer', name: 'Chișinău → Barcelona', price: '31', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Chișinău → Istanbul', price: '32', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Chișinău → London', price: '39', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Chișinău → Vienna', price: '39', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Chișinău → Paris', price: '73', priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Chișinău → Tel Aviv', price: '45', priceCurrency: 'EUR' },
  ],
})

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
  // Additional spring offers (inspired by zbor.md pricing)
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'NAP', toCity: t('airports.city_NAP'), flag: '🇮🇹', price: '24', originalPrice: '75', discount: '68', validUntil: '2026-04-30', tags: [t('deals.deal7Tag')], description: t('deals.deal7Desc') },
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'BER', toCity: t('airports.city_BER'), flag: '🇩🇪', price: '29', originalPrice: '85', discount: '66', validUntil: '2026-04-15', tags: [t('deals.deal8Tag')], description: t('deals.deal8Desc') },
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'ATH', toCity: t('airports.city_ATH'), flag: '🇬🇷', price: '35', originalPrice: '90', discount: '61', validUntil: '2026-05-30', tags: [t('deals.deal9Tag')], description: t('deals.deal9Desc') },
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'PRG', toCity: t('airports.city_PRG'), flag: '🇨🇿', price: '28', originalPrice: '80', discount: '65', validUntil: '2026-04-20', tags: [t('deals.deal10Tag')], description: t('deals.deal10Desc') },
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'CPH', toCity: t('airports.city_CPH'), flag: '🇩🇰', price: '33', originalPrice: '95', discount: '65', validUntil: '2026-05-15', tags: [t('deals.deal11Tag')], description: t('deals.deal11Desc') },
  { from: 'RMO', fromCity: t('airports.city_RMO'), to: 'LIS', toCity: t('airports.city_LIS'), flag: '🇵🇹', price: '42', originalPrice: '120', discount: '65', validUntil: '2026-05-30', tags: [t('deals.deal12Tag')], description: t('deals.deal12Desc') },
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
        <span class="flex items-center gap-1.5">
          <svg aria-hidden="true" class="w-4 h-4 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2.5s1 3.5-2 6c0-3-3.5-6-3.5-6S5 6 5 10a7 7 0 1014 0c0-4-5.5-7.5-5.5-7.5z"/></svg>
          {{ t('deals.flashSale') }} — {{ t('deals.title') }}!
        </span>
        <span aria-hidden="true" class="bg-white/20 px-3 py-1 rounded-full font-mono text-lg tracking-widest">{{ flashCountdown }}</span>
        <span class="text-red-200 text-xs">{{ t('deals.flashSaleEnds') }}</span>
      </div>
    </div>

  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="text-center mb-10">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>
      </div>
      <h1 class="text-3xl font-black text-gray-900 mb-3">{{ t('deals.title') }}</h1>
      <p class="text-gray-500">{{ t('deals.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="(deal, di) in deals" :key="deal.to"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group reveal"
        :style="`transition-delay: ${di * 0.08}s`">
        <!-- Deal header with destination photo -->
        <DestinationPhoto :code="deal.to" height-class="h-44">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10"
            :aria-label="t('deals.discountLabel', { n: deal.discount })">
            <span aria-hidden="true">-{{ deal.discount }}%</span>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
            <div class="text-xl font-black">{{ deal.fromCity }} <span aria-hidden="true">→</span> {{ deal.toCity }}</div>
            <div class="text-white/60 text-xs mt-0.5">{{ deal.from }} — {{ deal.to }}</div>
          </div>
        </DestinationPhoto>

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
            <span v-if="showMdl" class="text-sm font-bold text-gray-500">≈ {{ Math.round(parseInt(deal.price) * 19.5) }} MDL</span>
            <span class="text-gray-400 line-through text-sm" :aria-label="t('deals.originalPriceLabel', { price: deal.originalPrice })">€{{ deal.originalPrice }}</span>
            <span class="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{{ t('deals.save') }}{{ parseInt(deal.originalPrice) - parseInt(deal.price) }}</span>
          </div>
          <p class="text-xs text-gray-400 mb-4">{{ t('deals.perPerson') }} · {{ t('deals.flashSaleEnds') }} {{ new Date(deal.validUntil).toLocaleDateString(String(locale), {day: 'numeric', month: 'long'}) }}</p>

          <button @click="bookDeal(deal)" :disabled="searchingDeal !== null"
            :aria-label="t('deals.bookBtnLabel', { from: deal.fromCity, to: deal.toCity, price: deal.price })"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <div v-if="searchingDeal === deal.to" role="status" :aria-label="t('common.loading')" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span v-else>{{ t('deals.bookNow') }} <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Best months to fly — price calendar -->
    <div class="mt-10 bg-white rounded-2xl border border-gray-200 p-6 reveal">
      <h3 class="font-black text-gray-900 text-lg mb-1 flex items-center gap-2">
        <svg class="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        {{ t('deals.bestMonths') }}
      </h3>
      <p class="text-gray-500 text-sm mb-5">{{ t('deals.bestMonthsDesc') }}</p>
      <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
        <div v-for="(m, i) in [
          { name: t('priceTrends.jan'), price: 38, hot: false },
          { name: t('priceTrends.feb'), price: 35, hot: true },
          { name: t('priceTrends.mar'), price: 32, hot: true },
          { name: t('priceTrends.apr'), price: 42, hot: false },
          { name: t('priceTrends.may'), price: 55, hot: false },
          { name: t('priceTrends.jun'), price: 65, hot: false },
          { name: t('priceTrends.jul'), price: 78, hot: false },
          { name: t('priceTrends.aug'), price: 82, hot: false },
          { name: t('priceTrends.sep'), price: 48, hot: false },
          { name: t('priceTrends.oct'), price: 38, hot: false },
          { name: t('priceTrends.nov'), price: 31, hot: true },
          { name: t('priceTrends.dec'), price: 42, hot: false },
        ]" :key="i"
          class="rounded-xl p-3 text-center border transition-all"
          :class="m.hot ? 'bg-green-50 border-green-200' : (i === new Date().getMonth() ? 'bg-brand-50 border-brand-200' : 'border-gray-100 hover:border-gray-200')">
          <div class="text-xs font-bold text-gray-500 mb-1" :class="i === new Date().getMonth() ? 'text-brand-600' : ''">{{ m.name }}</div>
          <div class="font-black text-lg" :class="m.hot ? 'text-green-600' : 'text-gray-700'">€{{ m.price }}</div>
          <div v-if="m.hot" class="text-[10px] text-green-600 font-semibold mt-0.5">{{ t('deals.bestLabel') }}</div>
          <div v-else-if="i === new Date().getMonth()" class="text-[10px] text-brand-600 font-semibold mt-0.5">{{ t('deals.nowLabel') }}</div>
        </div>
      </div>
    </div>

    <div class="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-100 flex items-center justify-center">
        <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <p class="text-amber-800 font-medium mb-1">{{ t('deals.priceNote') }}</p>
      <p class="text-amber-700 text-sm">{{ t('deals.priceNoteSub') }}</p>
    </div>

    <!-- Group booking CTA (inspired by zbor.md) -->
    <div class="mt-8 bg-gray-950 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
      <DestinationPhoto code="IST" :width="800" height-class="absolute inset-0 opacity-20" :no-animation="true" />
      <div class="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent"></div>
      <div class="relative z-10 flex-1">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
          </div>
          <h3 class="font-black text-xl">{{ t('deals.groupTitle') }}</h3>
        </div>
        <p class="text-gray-400 text-sm leading-relaxed">{{ t('deals.groupDesc') }}</p>
      </div>
      <NuxtLink to="/contact" class="relative z-10 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors whitespace-nowrap glow-cta">
        {{ t('deals.groupCta') }} →
      </NuxtLink>
    </div>
  </div>
  </div>
</template>
