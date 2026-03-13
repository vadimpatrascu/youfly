<script setup lang="ts">
useHead({ title: 'Status Zbor — YouFly' })

const flightNumber = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const result = ref<any>(null)
const loading = ref(false)
const error = ref('')

// Mock flight statuses for demo
const mockStatuses: Record<string, any> = {
  'W6 1234': { status: 'on_time', airline: 'Wizz Air', from: 'RMO', fromCity: 'Chișinău', to: 'BCN', toCity: 'Barcelona', depSched: '06:30', depActual: '06:30', arrSched: '08:55', arrActual: '08:55', gate: 'A3', terminal: '1' },
  'TK 371': { status: 'delayed', airline: 'Turkish Airlines', from: 'RMO', fromCity: 'Chișinău', to: 'IST', toCity: 'Istanbul', depSched: '09:15', depActual: '10:45', arrSched: '12:20', arrActual: '13:50', gate: 'B7', terminal: '2', delay: 90 },
  'FR 1842': { status: 'on_time', airline: 'Ryanair', from: 'RMO', fromCity: 'Chișinău', to: 'LTN', toCity: 'Londra', depSched: '14:20', depActual: '14:20', arrSched: '16:45', arrActual: '16:45', gate: 'C2', terminal: '1' },
  'OS 794': { status: 'cancelled', airline: 'Austrian Airlines', from: 'RMO', fromCity: 'Chișinău', to: 'VIE', toCity: 'Viena', depSched: '11:00', depActual: null, arrSched: '12:35', arrActual: null, gate: null, terminal: '1' },
}

function search() {
  if (!flightNumber.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  // Simulate API delay
  setTimeout(() => {
    const key = flightNumber.value.trim().toUpperCase()
    const mock = mockStatuses[key] || null
    if (mock) {
      result.value = mock
    } else {
      error.value = `Zborul ${key} nu a fost găsit pentru data selectată.`
    }
    loading.value = false
  }, 800)
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  on_time: { label: 'La timp', color: 'text-green-700', bg: 'bg-green-100', icon: '✓' },
  delayed: { label: 'Întârziat', color: 'text-orange-700', bg: 'bg-orange-100', icon: '⏱' },
  cancelled: { label: 'Anulat', color: 'text-red-700', bg: 'bg-red-100', icon: '✕' },
  landed: { label: 'Aterizat', color: 'text-blue-700', bg: 'bg-blue-100', icon: '↓' },
  boarding: { label: 'Îmbarcare', color: 'text-purple-700', bg: 'bg-purple-100', icon: '→' },
}

const popularFlights = ['W6 1234', 'TK 371', 'FR 1842', 'OS 794']
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="text-center mb-8">
      <div class="text-5xl mb-4">✈️</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Status Zbor</h1>
      <p class="text-gray-500">Verifică în timp real starea zborului tău</p>
    </div>

    <!-- Search form -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model="flightNumber" type="text" placeholder="Ex: W6 1234, TK 371"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase tracking-wider text-center"
          @keyup.enter="search" />
        <input v-model="date" type="date"
          class="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button @click="search" :disabled="loading"
          class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors min-w-[100px]">
          <span v-if="loading" class="flex justify-center">
            <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
          </span>
          <span v-else>Caută</span>
        </button>
      </div>

      <!-- Popular flights chips -->
      <div class="mt-4">
        <p class="text-xs text-gray-400 mb-2">Exemple de zbor:</p>
        <div class="flex gap-2 flex-wrap">
          <button v-for="f in popularFlights" :key="f"
            @click="flightNumber = f; search()"
            class="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-brand-400 text-gray-600 font-mono transition-colors">
            {{ f }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-600">
      {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <!-- Status header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-xs text-gray-400 mb-1">{{ result.airline }}</p>
            <p class="text-2xl font-mono font-bold text-gray-900">{{ flightNumber.toUpperCase() }}</p>
          </div>
          <span class="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
            :class="`${statusConfig[result.status]?.bg} ${statusConfig[result.status]?.color}`">
            {{ statusConfig[result.status]?.icon }}
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
            <div class="text-xs text-gray-400 mb-1">✈</div>
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
          <p class="text-xs text-gray-400 mb-2 uppercase tracking-wide">Plecare</p>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold" :class="result.status === 'delayed' ? 'text-orange-600' : 'text-gray-900'">
              {{ result.depActual || '—' }}
            </span>
            <span v-if="result.status === 'delayed'" class="text-sm text-gray-400 line-through">{{ result.depSched }}</span>
          </div>
          <p v-if="result.gate" class="text-xs text-gray-500 mt-1">Poartă {{ result.gate }} · Terminal {{ result.terminal }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-2 uppercase tracking-wide">Sosire</p>
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
          ⏱ Zbor întârziat cu <strong>{{ result.delay }} minute</strong>
        </div>
      </div>
      <div v-if="result.status === 'cancelled'" class="px-6 pb-5">
        <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
          ✕ Zborul a fost anulat. Contactați compania aeriană pentru rebooking sau rambursare.
        </div>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center mt-6">Date demo — în producție se conectează la surse de date în timp real</p>
  </div>
</template>
