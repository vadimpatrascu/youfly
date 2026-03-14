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

// Mock flight statuses for demo
const mockStatuses = computed<Record<string, any>>(() => ({
  'W6 1234': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'BCN', toCity: t('index.city_BCN'), depSched: '06:30', depActual: '06:30', arrSched: '08:55', arrActual: '08:55', gate: 'A3', terminal: '1' },
  'TK 371': { status: 'delayed', airline: 'Turkish Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'IST', toCity: t('index.city_IST'), depSched: '09:15', depActual: '10:45', arrSched: '12:20', arrActual: '13:50', gate: 'B7', terminal: '2', delay: 90 },
  'FR 1842': { status: 'on_time', airline: 'Ryanair', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'LTN', toCity: t('index.city_LTN'), depSched: '14:20', depActual: '14:20', arrSched: '16:45', arrActual: '16:45', gate: 'C2', terminal: '1' },
  'OS 794': { status: 'cancelled', airline: 'Austrian Airlines', from: 'RMO', fromCity: t('airports.city_RMO'), to: 'VIE', toCity: t('index.city_VIE'), depSched: '11:00', depActual: null, arrSched: '12:35', arrActual: null, gate: null, terminal: '1' },
}))

function search() {
  if (!flightNumber.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  // Simulate API delay
  setTimeout(() => {
    const key = flightNumber.value.trim().toUpperCase()
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

const popularFlights = ['W6 1234', 'TK 371', 'FR 1842', 'OS 794']
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="text-center mb-8">
      <div aria-hidden="true" class="text-5xl mb-4">✈️</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('flightStatus.title') }}</h1>
      <p class="text-gray-500">{{ t('flightStatus.subtitle') }}</p>
    </div>

    <!-- Search form -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="flightNumber" type="text" :placeholder="t('flightStatus.placeholder')"
          :aria-label="t('flightStatus.placeholder')"
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
      <!-- Status header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-xs text-gray-400 mb-1">{{ result.airline }}</p>
            <p class="text-2xl font-mono font-bold text-gray-900">{{ flightNumber.toUpperCase() }}</p>
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

    <p class="text-xs text-gray-400 text-center mt-6">{{ t('flightStatus.demoNote') }}</p>
  </div>
</template>
