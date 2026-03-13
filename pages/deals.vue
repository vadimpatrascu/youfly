<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
useHead({ title: 'Oferte speciale — YouFly' })

const searchStore = useSearchStore()
const router = useRouter()

const deals = [
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'BCN', toCity: 'Barcelona',
    flag: '🇪🇸',
    price: '31',
    originalPrice: '95',
    discount: '67',
    validUntil: '2026-03-31',
    tags: ['Ofertă limitată', 'Direct'],
    description: 'Zbor direct la Barcelona cu Wizz Air. Perfecte pentru city break!'
  },
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'IST', toCity: 'Istanbul',
    flag: '🇹🇷',
    price: '32',
    originalPrice: '78',
    discount: '59',
    validUntil: '2026-04-15',
    tags: ['Popular', 'Direct'],
    description: 'Istanbul — orașul dintre două lumi. Rezervați acum pentru primăvară!'
  },
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'LTN', toCity: 'Londra',
    flag: '🇬🇧',
    price: '39',
    originalPrice: '120',
    discount: '68',
    validUntil: '2026-03-25',
    tags: ['Top deal', '1 escală'],
    description: 'Londra la prețuri excepționale. Ofertă limitată — mai sunt puține locuri!'
  },
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'VIE', toCity: 'Viena',
    flag: '🇦🇹',
    price: '39',
    originalPrice: '95',
    discount: '59',
    validUntil: '2026-04-30',
    tags: ['Recomandat'],
    description: 'Viena — capitala muzicii clasice. Ideal pentru un weekend cultural.'
  },
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'CDG', toCity: 'Paris',
    flag: '🇫🇷',
    price: '73',
    originalPrice: '185',
    discount: '61',
    validUntil: '2026-05-15',
    tags: ['City break'],
    description: 'Paris, "Orașul Luminilor" — vă așteaptă Turnul Eiffel și bucătăria franțuzească!'
  },
  {
    from: 'RMO', fromCity: 'Chișinău',
    to: 'TLV', toCity: 'Tel Aviv',
    flag: '🇮🇱',
    price: '45',
    originalPrice: '110',
    discount: '59',
    validUntil: '2026-04-20',
    tags: ['Mediterana'],
    description: 'Tel Aviv — plaje mediteraneene și gastronomie fascinantă.'
  },
]

const searchingDeal = ref<string | null>(null)

async function bookDeal(deal: typeof deals[0]) {
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
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="text-center mb-10">
      <div class="text-4xl mb-3">🔥</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Oferte speciale de zbor</h1>
      <p class="text-gray-500">Prețuri excepționale pentru rutele tale preferate. Ofertele sunt limitate în timp!</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="deal in deals" :key="deal.to"
        class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
        <!-- Deal header -->
        <div class="bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white relative">
          <div class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{{ deal.discount }}%
          </div>
          <div class="text-3xl mb-2">{{ deal.flag }}</div>
          <div class="text-xl font-bold">{{ deal.fromCity }} → {{ deal.toCity }}</div>
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
            <span class="text-gray-400 line-through text-sm">€{{ deal.originalPrice }}</span>
            <span class="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Economisești €{{ parseInt(deal.originalPrice) - parseInt(deal.price) }}</span>
          </div>
          <p class="text-xs text-gray-400 mb-4">Per persoană, inclusiv taxe · Valabil până {{ new Date(deal.validUntil).toLocaleDateString('ro-MD', {day: 'numeric', month: 'long'}) }}</p>

          <button @click="bookDeal(deal)" :disabled="searchingDeal !== null"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-wait text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <div v-if="searchingDeal === deal.to" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span v-else>Caută zboruri →</span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <div class="text-2xl mb-2">⚠️</div>
      <p class="text-amber-800 font-medium mb-1">Prețurile sunt orientative și se pot schimba</p>
      <p class="text-amber-700 text-sm">Prețurile afișate sunt cele mai mici disponibile în perioada respectivă. Prețul final poate varia în funcție de disponibilitate și data exactă de călătorie.</p>
    </div>
  </div>
</template>
