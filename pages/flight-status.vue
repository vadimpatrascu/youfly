<script setup lang="ts">
const { t } = useI18n()
useSeo({ title: t('flightStatus.title'), description: t('flightStatus.subtitle') })
useBreadcrumbStructuredData([
  { name: 'YouFly', url: '/' },
  { name: t('flightStatus.title'), url: '/flight-status' },
])

const flightNumber = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const result = ref<any>(null)
const loading = ref(false)
const error = ref('')

// Real Chișinău (RMO) flights — based on actual airport schedule data
const mockStatuses = computed<Record<string, any>>(() => ({
  // Wizz Air flights (largest carrier at RMO)
  'W6 3937': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'BCN', toCity: t('airports.city_BCN'), depSched: '05:45', depActual: '05:45', arrSched: '08:30', arrActual: '08:30', gate: 'A2', terminal: '1' },
  'W6 3981': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'FKB', toCity: 'Karlsruhe', depSched: '06:10', depActual: '06:10', arrSched: '08:15', arrActual: '08:15', gate: 'A4', terminal: '1' },
  'W6 3993': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'CPH', toCity: 'Copenhagen', depSched: '06:35', depActual: '06:35', arrSched: '08:50', arrActual: '08:50', gate: 'A5', terminal: '1' },
  'W6 6946': { status: 'landed', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'NAP', toCity: 'Naples', depSched: '21:05', depActual: '21:05', arrSched: '23:10', arrActual: '23:08', gate: 'A1', terminal: '1' },
  'W6 5484': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'LTN', toCity: t('airports.city_LTN'), depSched: '21:25', depActual: '21:25', arrSched: '23:15', arrActual: '23:15', gate: 'A3', terminal: '1' },
  'W6 3989': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'FCO', toCity: 'Roma', depSched: '23:55', depActual: '23:55', arrSched: '02:00', arrActual: '02:00', gate: 'A6', terminal: '1' },
  // Turkish Airlines
  'TK 272': { status: 'on_time', airline: 'Turkish Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'IST', toCity: t('airports.city_IST'), depSched: '21:35', depActual: '21:35', arrSched: '00:30', arrActual: '00:30', gate: 'B2', terminal: '1' },
  'TK 276': { status: 'delayed', airline: 'Turkish Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'IST', toCity: t('airports.city_IST'), depSched: '03:05', depActual: '03:55', arrSched: '06:00', arrActual: '06:50', gate: 'B1', terminal: '1', delay: 50 },
  // TAROM
  'RO 210': { status: 'on_time', airline: 'TAROM', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'OTP', toCity: t('airports.city_OTP'), depSched: '04:50', depActual: '04:50', arrSched: '05:55', arrActual: '05:55', gate: 'B3', terminal: '1' },
  // Austrian Airlines
  'OS 720': { status: 'on_time', airline: 'Austrian Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'VIE', toCity: t('airports.city_VIE'), depSched: '05:25', depActual: '05:25', arrSched: '07:10', arrActual: '07:10', gate: 'B4', terminal: '1' },
  // HiSky
  'H4 403': { status: 'on_time', airline: 'HiSky', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'DUS', toCity: 'Düsseldorf', depSched: '07:00', depActual: '07:00', arrSched: '09:30', arrActual: '09:30', gate: 'A7', terminal: '1' },
  // FlyOne
  '5F 102': { status: 'on_time', airline: 'FlyOne', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'TLV', toCity: t('airports.city_TLV'), depSched: '08:30', depActual: '08:30', arrSched: '12:00', arrActual: '12:00', gate: 'A8', terminal: '1' },
  '5F 534': { status: 'on_time', airline: 'FlyOne', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'EVN', toCity: 'Yerevan', depSched: '00:10', depActual: '00:10', arrSched: '04:30', arrActual: '04:30', gate: 'A1', terminal: '1' },
  // LOT Polish Airlines
  'LO 598': { status: 'cancelled', airline: 'LOT Polish Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'WAW', toCity: t('airports.city_WAW'), depSched: '13:40', depActual: null, arrSched: '15:20', arrActual: null, gate: null, terminal: '1' },
  // Lufthansa
  'LH 1493': { status: 'on_time', airline: 'Lufthansa', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'FRA', toCity: 'Frankfurt', depSched: '06:00', depActual: '06:00', arrSched: '08:20', arrActual: '08:20', gate: 'B5', terminal: '1' },
  // flydubai
  'FZ 780': { status: 'boarding', airline: 'flydubai', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'DXB', toCity: 'Dubai', depSched: '22:00', depActual: '22:00', arrSched: '05:30', arrActual: '05:30', gate: 'B6', terminal: '1' },
}))

function search() {
  if (!flightNumber.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  setTimeout(() => {
    const key = flightNumber.value.trim().toUpperCase().replace(/\s+/g, ' ')
    const mock = mockStatuses.value[key] || null
    if (mock) {
      result.value = mock
    } else {
      error.value = t('flightStatus.notFound', { flight: key })
    }
    loading.value = false
  }, 800)
}

const statusConfig = computed(() => ({
  on_time: { label: t('flightStatus.onTime'), color: 'text-green-700', bg: 'bg-green-100', icon: '✓' },
  delayed: { label: t('flightStatus.delayed'), color: 'text-orange-700', bg: 'bg-orange-100', icon: '⏱' },
  cancelled: { label: t('flightStatus.cancelled'), color: 'text-red-700', bg: 'bg-red-100', icon: '✕' },
  landed: { label: t('flightStatus.landed'), color: 'text-blue-700', bg: 'bg-blue-100', icon: '↓' },
  boarding: { label: t('flightStatus.boarding'), color: 'text-purple-700', bg: 'bg-purple-100', icon: '→' },
} as Record<string, { label: string; color: string; bg: string; icon: string }>))

const popularFlights = ['W6 3937', 'TK 272', 'RO 210', 'OS 720', 'FZ 780', 'LO 598']

// ── Departures/Arrivals board ──
const boardTab = ref<'departures' | 'arrivals'>('departures')

const departureBoard = computed(() => Object.entries(mockStatuses.value).map(([fn, f]) => ({
  flightNumber: fn, ...f,
})).sort((a, b) => (a.depSched || '').localeCompare(b.depSched || '')))

// Mock arrival flights (inbound to RMO)
const arrivalBoard = computed(() => [
  { flightNumber: 'TK 271', airline: 'Turkish Airlines', from: 'IST', fromCity: t('airports.city_IST'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '18:25', arrSched: '20:50', arrActual: '20:50', status: 'landed', gate: 'B2' },
  { flightNumber: 'W6 3938', airline: 'Wizz Air', from: 'BCN', fromCity: t('airports.city_BCN'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '09:30', arrSched: '14:15', arrActual: '14:15', status: 'landed', gate: 'A2' },
  { flightNumber: 'OS 719', airline: 'Austrian Airlines', from: 'VIE', fromCity: t('airports.city_VIE'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '21:00', arrSched: '00:45', arrActual: '00:45', status: 'on_time', gate: 'B4' },
  { flightNumber: 'RO 209', airline: 'TAROM', from: 'OTP', fromCity: t('airports.city_OTP'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '22:30', arrSched: '23:35', arrActual: '23:35', status: 'on_time', gate: 'B3' },
  { flightNumber: 'W6 5483', airline: 'Wizz Air', from: 'LTN', fromCity: t('airports.city_LTN'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '16:45', arrSched: '22:15', arrActual: '22:15', status: 'on_time', gate: 'A3' },
  { flightNumber: 'TK 275', airline: 'Turkish Airlines', from: 'IST', fromCity: t('airports.city_IST'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '23:15', arrSched: '01:30', arrActual: '01:55', status: 'delayed', delay: 25, gate: 'B1' },
  { flightNumber: 'LH 1492', airline: 'Lufthansa', from: 'FRA', fromCity: 'Frankfurt', to: 'RMO', toCity: t('airports.city_RMO'), depSched: '19:30', arrSched: '23:50', arrActual: '23:50', status: 'on_time', gate: 'B5' },
  { flightNumber: 'LO 597', airline: 'LOT Polish Airlines', from: 'WAW', fromCity: t('airports.city_WAW'), to: 'RMO', toCity: t('airports.city_RMO'), depSched: '10:00', arrSched: '12:40', arrActual: '12:40', status: 'landed', gate: 'B3' },
].sort((a, b) => a.arrSched.localeCompare(b.arrSched)))

const currentBoard = computed(() => boardTab.value === 'departures' ? departureBoard.value : arrivalBoard.value)
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
        <svg class="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
      </div>
      <h1 class="text-3xl font-black mb-2">{{ t('flightStatus.title') }}</h1>
      <p class="text-gray-400 mb-3">{{ t('flightStatus.subtitle') }}</p>
      <div class="flex items-center justify-center gap-4 text-xs text-gray-500">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> {{ departureBoard.filter(f => f.status === 'on_time').length }} {{ t('flightStatus.onTime') }}</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-orange-400 rounded-full"></span> {{ departureBoard.filter(f => f.status === 'delayed').length }} {{ t('flightStatus.delayed') }}</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 bg-blue-400 rounded-full"></span> {{ departureBoard.filter(f => f.status === 'landed' || f.status === 'boarding').length }} {{ t('flightStatus.active') }}</span>
      </div>
      </div>
    </div>
  <div class="max-w-2xl mx-auto px-4 py-12">

    <!-- Search form -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="flightNumber" type="text" :placeholder="t('flightStatus.placeholder')"
          :aria-label="t('flightStatus.placeholder')" autocapitalize="characters" autocomplete="off" spellcheck="false"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase tracking-wider text-center"
          @keyup.enter="search" />
        <input v-model="date" type="date"
          :aria-label="t('flightStatus.dateLabel')"
          class="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button @click="search" :disabled="loading"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors min-w-[100px]">
          <span v-if="loading" role="status" :aria-label="t('common.loading')" class="flex justify-center">
            <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
          </span>
          <span v-else>{{ t('flightStatus.check') }}</span>
        </button>
      </div>

      <!-- Popular flights chips -->
      <div class="mt-4">
        <p class="text-xs text-gray-400 mb-2" id="popular-flights-label">{{ t('flightStatus.popular') }}</p>
        <div class="flex gap-2 flex-wrap" role="group" aria-labelledby="popular-flights-label">
          <button v-for="f in popularFlights" :key="f"
            @click="flightNumber = f; search()"
            :aria-label="t('flightStatus.checkFlight', { flight: f })"
            class="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-brand-400 text-gray-600 font-mono transition-colors">
            {{ f }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" role="alert" aria-live="assertive" class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-600">
      {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result" aria-live="polite" aria-atomic="true" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <!-- Destination photo strip -->
      <DestinationPhoto :code="result.to" height-class="h-24">
        <div class="absolute inset-0 bg-gradient-to-r from-gray-950/70 via-transparent to-gray-950/70"></div>
        <div class="relative z-10 flex items-center justify-center h-full text-white font-black text-lg tracking-wider">
          {{ result.from }} <span aria-hidden="true" class="mx-2 text-brand-400">✈</span> {{ result.to }}
        </div>
      </DestinationPhoto>
      <!-- Status header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-black shrink-0">
              {{ flightNumber.trim().toUpperCase().split(/\s?\d/)[0] }}
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">{{ result.airline }}</p>
              <p class="text-2xl font-mono font-bold text-gray-900">{{ flightNumber.toUpperCase() }}</p>
            </div>
          </div>
          <span class="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
            :class="`${statusConfig[result.status]?.bg} ${statusConfig[result.status]?.color}`">
            <span aria-hidden="true">{{ statusConfig[result.status]?.icon }}</span>
            {{ statusConfig[result.status]?.label }}
          </span>
        </div>

        <!-- Route timeline -->
        <div class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ result.from }}</div>
            <div class="text-xs text-gray-500">{{ result.fromCity }}</div>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <div aria-hidden="true" class="text-xs text-gray-400 mb-1">✈</div>
            <div class="w-full h-px bg-gray-200 relative">
              <div v-if="result.status === 'on_time'" class="absolute inset-0 bg-green-400 animate-pulse"></div>
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ result.to }}</div>
            <div class="text-xs text-gray-500">{{ result.toCity }}</div>
          </div>
        </div>
      </div>

      <!-- Time details -->
      <div class="p-6 grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-400 mb-2 uppercase tracking-wide">{{ t('flightStatus.departure') }}</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold" :class="result.status === 'delayed' ? 'text-orange-600' : 'text-gray-900'">
              {{ result.depActual || '—' }}
            </span>
            <span v-if="result.status === 'delayed'" class="text-sm text-gray-400 line-through">{{ result.depSched }}</span>
          </div>
          <p v-if="result.gate" class="text-xs text-gray-500 mt-1">{{ t('flightStatus.gate') }} {{ result.gate }} · {{ t('flightStatus.terminal') }} {{ result.terminal }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-2 uppercase tracking-wide">{{ t('flightStatus.arrival') }}</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold" :class="result.status === 'delayed' ? 'text-orange-600' : 'text-gray-900'">
              {{ result.arrActual || '—' }}
            </span>
            <span v-if="result.status === 'delayed'" class="text-sm text-gray-400 line-through">{{ result.arrSched }}</span>
          </div>
        </div>
      </div>

      <!-- Delay alert -->
      <div v-if="result.delay" class="px-6 pb-5">
        <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-700 flex items-center gap-2">
          <span aria-hidden="true">⏱</span> {{ t('flightStatus.delayed') }} {{ result.delay }} {{ t('flightStatus.minutesDelay') }}
        </div>
      </div>
      <div v-if="result.status === 'cancelled'" class="px-6 pb-5">
        <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
          <span aria-hidden="true">✕</span> {{ t('flightStatus.cancelledNote') }}
        </div>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center mt-6 mb-10">{{ t('flightStatus.demoNote') }}</p>

    <!-- ── Live Flight Board ── -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="flex items-center border-b border-gray-200">
        <button @click="boardTab = 'departures'"
          class="flex-1 py-3 text-center text-sm font-semibold transition-colors"
          :class="boardTab === 'departures' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700'">
          <span aria-hidden="true">🛫</span> {{ t('flightStatus.departures')  }}
        </button>
        <button @click="boardTab = 'arrivals'"
          class="flex-1 py-3 text-center text-sm font-semibold transition-colors"
          :class="boardTab === 'arrivals' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-gray-500 hover:text-gray-700'">
          <span aria-hidden="true">🛬</span> {{ t('flightStatus.arrivals')  }}
        </button>
      </div>

      <div class="p-4">
        <p class="text-xs text-gray-400 mb-3">{{ currentBoard.length }} {{ t('flightStatus.allFlights')  }}</p>
        <div class="overflow-x-auto -mx-4 px-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th class="pb-2 text-left font-semibold">{{ t('flightStatus.flight')  }}</th>
                <th class="pb-2 text-left font-semibold">{{ t('flightStatus.destination') }}</th>
                <th class="pb-2 text-left font-semibold">{{ t('flightStatus.time')  }}</th>
                <th class="pb-2 text-left font-semibold">{{ t('flightStatus.status')  }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="f in currentBoard" :key="f.flightNumber"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="flightNumber = f.flightNumber; search()">
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-[10px] font-black shrink-0 border border-brand-100">
                      {{ f.flightNumber.split(/\s?\d/)[0] }}
                    </div>
                    <div>
                      <div class="font-mono font-bold text-gray-900 text-xs">{{ f.flightNumber }}</div>
                      <div class="text-[10px] text-gray-400">{{ f.airline }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="font-semibold text-gray-800">{{ boardTab === 'departures' ? f.toCity : f.fromCity }}</span>
                  <span class="text-gray-400 text-xs ml-1">{{ boardTab === 'departures' ? f.to : f.from }}</span>
                </td>
                <td class="py-3 font-mono text-gray-700">
                  {{ boardTab === 'departures' ? f.depSched : f.arrSched }}
                </td>
                <td class="py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="`${statusConfig[f.status]?.bg} ${statusConfig[f.status]?.color}`">
                    {{ statusConfig[f.status]?.label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
