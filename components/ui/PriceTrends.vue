<script setup lang="ts">
// Static price trend visualization - shows example monthly price trends
const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const routes = [
  {
    name: 'Chișinău → București',
    prices: [42, 38, 35, 45, 55, 62, 75, 78, 52, 40, 36, 38],
    color: '#1a56db',
  },
  {
    name: 'Chișinău → Londra',
    prices: [55, 50, 48, 60, 72, 85, 110, 115, 78, 58, 48, 50],
    color: '#e74694',
  },
]

const selectedRoute = ref(0)
const currentRoute = computed(() => routes[selectedRoute.value])

const maxPrice = computed(() => Math.max(...currentRoute.value.prices))
const minPrice = computed(() => Math.min(...currentRoute.value.prices))

function barHeight(price: number): number {
  const range = maxPrice.value - minPrice.value
  if (range === 0) return 50
  return 20 + ((price - minPrice.value) / range) * 80
}

const currentMonth = new Date().getMonth()
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h3 class="font-semibold text-gray-900">Tendințe prețuri</h3>
      <div class="flex gap-2">
        <button v-for="(r, i) in routes" :key="i"
          @click="selectedRoute = i"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="selectedRoute === i ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
          {{ r.name.split('→')[1].trim() }}
        </button>
      </div>
    </div>

    <div class="flex items-end gap-1 h-24 mb-2">
      <div v-for="(price, i) in currentRoute.prices" :key="i"
        class="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
        :title="`€${price}`">
        <div class="relative flex-1 w-full flex items-end">
          <div
            class="w-full rounded-t-sm transition-all"
            :style="{
              height: barHeight(price) + '%',
              background: i === currentMonth ? currentRoute.color : (price === minPrice ? '#10b981' : '#e5e7eb'),
            }"
          ></div>
          <!-- Tooltip -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
            €{{ price }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between text-xs text-gray-400">
      <span v-for="(m, i) in months" :key="i"
        class="text-center"
        :class="i === currentMonth ? 'text-brand-600 font-bold' : ''">
        {{ m }}
      </span>
    </div>

    <div class="mt-3 flex items-center justify-between text-xs">
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block bg-green-400"></span> Cel mai ieftin: €{{ minPrice }}</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm inline-block" :style="{background: currentRoute.color}"></span> Luna curentă: €{{ currentRoute.prices[currentMonth] }}</span>
      </div>
      <span class="text-gray-400">{{ currentRoute.name }}</span>
    </div>
  </div>
</template>
