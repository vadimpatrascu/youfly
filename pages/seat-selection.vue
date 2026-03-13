<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
const bookingStore = useBookingStore()
const router = useRouter()

useHead({ title: 'Selectare loc — YouFly' })

onMounted(() => {
  if (!bookingStore.selectedOffer || !bookingStore.passengers.length) router.push('/')
})

// Mock seat map: 30 rows, 6 seats (A-F)
const ROWS = 30
const COLS = ['A', 'B', 'C', 'D', 'E', 'F']

// Pre-taken seats (mock)
const takenSeats = new Set([
  '1A','1B','1C','1D','1E','1F',
  '2A','2B','2C','2D','2E','2F',
  '3A','3B','3C','3D','3E','3F',
  '5B','5D','7A','7C','8E','9F','10B','11A','12C','14D','15E','16A','17B','18D','20C','22A','24B','25E','28C','29A','29F',
])

// Seats selected by current passengers
const selectedSeats = ref<Record<string, string>>({}) // passengerId -> seat
const activePassengerIdx = ref(0)

const passengers = computed(() => bookingStore.passengers)

function getSeatStatus(row: number, col: string): 'taken' | 'selected' | 'mine' | 'free' {
  const seat = `${row}${col}`
  if (takenSeats.has(seat)) return 'taken'
  const selectedBy = Object.entries(selectedSeats.value).find(([, s]) => s === seat)
  if (selectedBy) {
    const passengerIdx = passengers.value.findIndex(p => p.duffelPassengerId === selectedBy[0])
    if (passengerIdx === activePassengerIdx.value) return 'mine'
    return 'selected'
  }
  return 'free'
}

function selectSeat(row: number, col: string) {
  const seat = `${row}${col}`
  if (takenSeats.has(seat)) return
  const currentPassenger = passengers.value[activePassengerIdx.value]
  if (!currentPassenger) return

  // Deselect if already selected by this passenger
  if (selectedSeats.value[currentPassenger.duffelPassengerId] === seat) {
    delete selectedSeats.value[currentPassenger.duffelPassengerId]
    return
  }

  // Check if taken by another passenger
  const takenByOther = Object.entries(selectedSeats.value).some(([id, s]) => s === seat && id !== currentPassenger.duffelPassengerId)
  if (takenByOther) return

  selectedSeats.value[currentPassenger.duffelPassengerId] = seat

  // Auto-advance to next passenger
  if (activePassengerIdx.value < passengers.value.length - 1) {
    activePassengerIdx.value++
  }
}

function getSeatClass(row: number, col: string): string {
  const status = getSeatStatus(row, col)
  const base = 'w-8 h-8 rounded-t-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-all border-b-2'
  if (status === 'taken') return base + ' bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60'
  if (status === 'mine') return base + ' bg-brand-500 border-brand-700 text-white scale-110 shadow-md'
  if (status === 'selected') return base + ' bg-brand-200 border-brand-400 text-brand-700'
  // Color by zone
  if (row <= 3) return base + ' bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-300'
  if (row <= 10) return base + ' bg-green-100 border-green-400 text-green-700 hover:bg-green-200'
  return base + ' bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
}

function isExit(row: number): boolean {
  return row === 10 || row === 20
}

const allSelected = computed(() => passengers.value.every(p => selectedSeats.value[p.duffelPassengerId]))

function proceed() {
  // Store seat selection (not yet used in booking, but mock for now)
  router.push('/payment')
}

function skip() {
  router.push('/payment')
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="text-gray-500 hover:text-gray-700 text-sm">← Înapoi</button>
      <h1 class="text-2xl font-bold text-gray-900">Selectare loc</h1>
      <button @click="skip" class="ml-auto text-sm text-gray-500 hover:text-brand-600 underline">Sari peste</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Seat map -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl border border-gray-200 p-4 overflow-x-auto">
          <!-- Legend -->
          <div class="flex items-center gap-4 mb-4 text-xs flex-wrap">
            <div class="flex items-center gap-1.5"><div class="w-5 h-5 bg-yellow-100 border-b-2 border-yellow-400 rounded-t-sm"></div> Business (1-3)</div>
            <div class="flex items-center gap-1.5"><div class="w-5 h-5 bg-green-100 border-b-2 border-green-400 rounded-t-sm"></div> Extra legroom (4-10)</div>
            <div class="flex items-center gap-1.5"><div class="w-5 h-5 bg-blue-50 border-b-2 border-blue-200 rounded-t-sm"></div> Standard</div>
            <div class="flex items-center gap-1.5"><div class="w-5 h-5 bg-brand-500 border-b-2 border-brand-700 rounded-t-sm"></div> Selectat</div>
            <div class="flex items-center gap-1.5"><div class="w-5 h-5 bg-gray-300 border-b-2 border-gray-400 rounded-t-sm opacity-60"></div> Ocupat</div>
          </div>

          <!-- Airplane nose -->
          <div class="text-center text-3xl mb-2">✈</div>

          <!-- Seat grid -->
          <div class="min-w-[280px]">
            <!-- Column headers -->
            <div class="flex items-center gap-1 mb-2 justify-center">
              <div class="w-8 text-xs text-center text-gray-400 font-mono"></div>
              <div class="w-2"></div>
              <div v-for="col in ['A','B','C']" :key="col" class="w-8 text-xs text-center text-gray-500 font-bold">{{ col }}</div>
              <div class="w-6"></div>
              <div v-for="col in ['D','E','F']" :key="col" class="w-8 text-xs text-center text-gray-500 font-bold">{{ col }}</div>
            </div>

            <div v-for="row in ROWS" :key="row">
              <!-- Exit row marker -->
              <div v-if="isExit(row)" class="flex items-center gap-1 my-1 text-xs text-orange-500 font-semibold">
                <div class="flex-1 h-px bg-orange-200"></div>
                <span>🚪 Ieșire urgență</span>
                <div class="flex-1 h-px bg-orange-200"></div>
              </div>

              <div class="flex items-center gap-1 mb-1 justify-center">
                <!-- Row number -->
                <div class="w-8 text-xs text-center text-gray-400 font-mono">{{ row }}</div>
                <div class="w-2"></div>
                <!-- Left seats A B C -->
                <div v-for="col in ['A','B','C']" :key="col"
                  :class="getSeatClass(row, col)"
                  @click="selectSeat(row, col)">
                  {{ col }}
                </div>
                <!-- Aisle -->
                <div class="w-6 text-center text-xs text-gray-300">|</div>
                <!-- Right seats D E F -->
                <div v-for="col in ['D','E','F']" :key="col"
                  :class="getSeatClass(row, col)"
                  @click="selectSeat(row, col)">
                  {{ col }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Passengers -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 class="font-semibold text-gray-900 mb-3">Pasageri</h3>
          <div class="space-y-2">
            <button v-for="(p, i) in passengers" :key="p.duffelPassengerId"
              @click="activePassengerIdx = i"
              class="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              :class="activePassengerIdx === i ? 'bg-brand-50 border border-brand-200' : 'bg-gray-50 border border-transparent hover:border-gray-200'">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                :class="activePassengerIdx === i ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'">
                {{ p.given_name?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="flex-1 text-left">
                <div class="text-sm font-medium text-gray-900">{{ p.given_name }} {{ p.family_name }}</div>
                <div v-if="selectedSeats[p.duffelPassengerId]" class="text-xs text-brand-600 font-semibold">
                  Loc: {{ selectedSeats[p.duffelPassengerId] }}
                </div>
                <div v-else class="text-xs text-gray-400">Nu a selectat</div>
              </div>
              <span v-if="selectedSeats[p.duffelPassengerId]" class="text-green-500">✓</span>
              <span v-else class="text-gray-300">○</span>
            </button>
          </div>
        </div>

        <button @click="proceed"
          class="w-full py-4 font-semibold rounded-xl text-lg transition-colors shadow-lg"
          :class="allSelected ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
          {{ allSelected ? 'Continuă la plată →' : 'Continuă fără loc selectat' }}
        </button>
        <p class="text-xs text-center text-gray-400">Selecția locului este opțională</p>
      </div>
    </div>
  </div>
</template>
