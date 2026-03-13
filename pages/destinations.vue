<script setup lang="ts">
import { useSearchStore } from '~/stores/search'

useHead({ title: 'Destinații — YouFly' })

const searchStore = useSearchStore()
const router = useRouter()
const searching = ref<string | null>(null)

const destinations = [
  { code: 'OTP', city: 'București', country: 'România', flag: '🇷🇴', price: 35, desc: 'Capitala României, plină de istorie, cultură și viață de noapte vibrantă.', emoji: '🏛️', pop: 5 },
  { code: 'IST', city: 'Istanbul', country: 'Turcia', flag: '🇹🇷', price: 32, desc: 'Metropola care unește Europa cu Asia, cu bazaruri, moscheile și Bosforul.', emoji: '🕌', pop: 5 },
  { code: 'LTN', city: 'Londra', country: 'Marea Britanie', flag: '🇬🇧', price: 39, desc: 'Capitala cosmopolită a Regatului Unit cu muzee gratuite și Big Ben iconic.', emoji: '🎡', pop: 5 },
  { code: 'BCN', city: 'Barcelona', country: 'Spania', flag: '🇪🇸', price: 31, desc: 'Arhitectura lui Gaudí, plajele mediteraneene și bucătăria catalană.', emoji: '🏖️', pop: 5 },
  { code: 'CDG', city: 'Paris', country: 'Franța', flag: '🇫🇷', price: 73, desc: 'Orașul luminilor, al Turnului Eiffel, modei și gastronomiei rafinate.', emoji: '🗼', pop: 5 },
  { code: 'VIE', city: 'Viena', country: 'Austria', flag: '🇦🇹', price: 39, desc: 'Imperială și elegantă, cu muzică clasică, cafenele și palate magnifice.', emoji: '🎻', pop: 4 },
  { code: 'MXP', city: 'Milano', country: 'Italia', flag: '🇮🇹', price: 59, desc: 'Capitala modei mondiale, cu Duomo, Leonardo și aperitivele perfecte.', emoji: '🛍️', pop: 4 },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', flag: '🇮🇱', price: 45, desc: 'Orasul care nu doarme niciodată — plaje, tech și gastronomie israeliană.', emoji: '🌊', pop: 4 },
  { code: 'BEG', city: 'Belgrad', country: 'Serbia', flag: '🇷🇸', price: 28, desc: 'Destinația emergentă a Balcanilor, vie de noapte legendară și fortăreața Kalemegdan.', emoji: '🏰', pop: 3 },
  { code: 'WAW', city: 'Varșovia', country: 'Polonia', flag: '🇵🇱', price: 33, desc: 'Capitala poloneză modernă cu centrul istoric reconstituit și o scenă culturală înfloritoare.', emoji: '🏙️', pop: 3 },
  { code: 'AMS', city: 'Amsterdam', country: 'Olanda', flag: '🇳🇱', price: 68, desc: 'Canale romantice, muzee de renume mondial și o atmosferă liberală unică.', emoji: '🚲', pop: 4 },
  { code: 'DXB', city: 'Dubai', country: 'UAE', flag: '🇦🇪', price: 89, desc: 'Luxul ultramodern al deșertului: zgârie-nori, mall-uri giganice și o oasis de șic.', emoji: '🏙️', pop: 4 },
]

const selectedRegion = ref('Toate')
const regions = ['Toate', 'Europa', 'Asia', 'Orientul Mijlociu']

const europeCodes = ['OTP', 'LTN', 'BCN', 'CDG', 'VIE', 'MXP', 'BEG', 'WAW', 'AMS']
const asiaCodes = ['IST']
const middleEastCodes = ['TLV', 'DXB']

const filtered = computed(() => {
  if (selectedRegion.value === 'Europa') return destinations.filter(d => europeCodes.includes(d.code))
  if (selectedRegion.value === 'Asia') return destinations.filter(d => asiaCodes.includes(d.code))
  if (selectedRegion.value === 'Orientul Mijlociu') return destinations.filter(d => middleEastCodes.includes(d.code))
  return destinations
})

async function search(dest: typeof destinations[0]) {
  searching.value = dest.code
  searchStore.origin = { iata_code: 'MD', airport_iata: 'RMO', name: 'Chișinău International Airport', city_name: 'Chișinău', country_code: 'MD' }
  searchStore.destination = { iata_code: '', airport_iata: dest.code, name: `${dest.city} Airport`, city_name: dest.city, country_code: '' }
  const next = new Date()
  next.setDate(next.getDate() + ((5 - next.getDay() + 7) % 7 || 7))
  searchStore.departureDate = next.toISOString().split('T')[0]
  searchStore.tripType = 'oneway'
  try {
    const ok = await searchStore.submitSearch()
    if (ok) router.push('/search')
  } finally {
    searching.value = null
  }
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="bg-gradient-to-br from-brand-600 to-brand-900 text-white py-14 px-4 text-center">
      <h1 class="text-4xl font-extrabold mb-3">Destinații Populare</h1>
      <p class="text-brand-200 text-lg max-w-xl mx-auto">Descoperă cele mai căutate destinații din Chișinău cu prețuri în timp real.</p>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-10">
      <!-- Region filter -->
      <div class="flex gap-2 mb-8 flex-wrap">
        <button v-for="r in regions" :key="r"
          @click="selectedRegion = r"
          class="px-5 py-2 rounded-full text-sm font-medium border transition-all"
          :class="selectedRegion === r
            ? 'bg-brand-600 text-white border-brand-600'
            : 'border-gray-200 text-gray-600 hover:border-brand-300 bg-white'">
          {{ r }}
        </button>
      </div>

      <!-- Destination grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="dest in filtered" :key="dest.code"
          class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-brand-300 hover:shadow-lg transition-all group">
          <!-- Colored header -->
          <div class="bg-gradient-to-br from-gray-100 to-gray-50 h-28 flex items-center justify-center relative">
            <span class="text-6xl">{{ dest.emoji }}</span>
            <span class="absolute top-3 right-3 text-2xl">{{ dest.flag }}</span>
            <span class="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              de la €{{ dest.price }}
            </span>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{{ dest.city }}</h3>
                <p class="text-sm text-gray-500">{{ dest.country }} · {{ dest.code }}</p>
              </div>
              <!-- Popularity stars -->
              <div class="flex text-yellow-400 text-xs">
                <span v-for="i in dest.pop" :key="i">★</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ dest.desc }}</p>
            <button @click="search(dest)"
              :disabled="searching !== null"
              class="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <span v-if="searching === dest.code">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              </span>
              <span v-else>✈ Caută zboruri</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
