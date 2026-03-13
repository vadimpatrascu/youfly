<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const searchStore = useSearchStore()

const tips = [
  'Se verifică disponibilitatea locurilor...',
  'Se compară prețurile de la 500+ companii aeriene...',
  'Se caută cele mai bune conexiuni...',
  'Se aplică filtrele de calitate...',
  'Se sortează ofertele pentru tine...',
  'Aproape gata...',
]

const destFacts: Record<string, string> = {
  'IST': '🕌 Istanbul este singurul oraș din lume pe două continente — Europa și Asia.',
  'BCN': '🏖️ Barcelona are 4,4 km de plajă urbană și 300 de zile însorite pe an.',
  'LTN': '🎡 Londra găzduiește cel mai mare sistem de metrou din lume — The Tube.',
  'CDG': '🗼 Turnul Eiffel a fost inițial destinat să fie demolat după 20 de ani.',
  'VIE': '🎻 Viena a dat naștere multor genii muzicale: Mozart, Beethoven, Schubert.',
  'OTP': '🏛️ București are cea mai mare clădire administrativă din lume — Palatul Parlamentului.',
  'MXP': '🛍️ Milano găzduiește 4 săptămâni de modă internațională pe an.',
  'TLV': '🌊 Tel Aviv are una dintre cele mai dinamice scene de startup-uri din lume.',
  'DXB': '🏙️ Dubai Burj Khalifa este cea mai înaltă clădire din lume — 828 de metri.',
}

const destFact = computed(() => {
  const dest = searchStore.destination?.airport_iata || ''
  return destFacts[dest] || null
})
const tipIndex = ref(0)
const progress = ref(0)
let tipInterval: ReturnType<typeof setInterval>
let progressInterval: ReturnType<typeof setInterval>

onMounted(() => {
  tipInterval = setInterval(() => {
    tipIndex.value = (tipIndex.value + 1) % tips.length
  }, 1400)

  // Animate progress bar from 0 to 90% over ~7 seconds
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 8
      if (progress.value > 90) progress.value = 90
    }
  }, 500)
})

onUnmounted(() => {
  clearInterval(tipInterval)
  clearInterval(progressInterval)
})
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
    <div class="text-center max-w-sm px-4">
      <!-- Route display -->
      <div v-if="searchStore.origin && searchStore.destination" class="flex items-center justify-center gap-3 mb-6">
        <div class="text-center">
          <div class="text-2xl font-black text-gray-900">{{ searchStore.origin.airport_iata || searchStore.origin.iata_code }}</div>
          <div class="text-xs text-gray-500">{{ searchStore.origin.city_name }}</div>
        </div>
        <div class="flex-1 flex flex-col items-center min-w-[80px]">
          <div class="text-2xl animate-bounce">✈️</div>
          <div class="w-full h-px bg-gradient-to-r from-brand-200 via-brand-500 to-brand-200 mt-1"></div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-black text-gray-900">{{ searchStore.destination.airport_iata || searchStore.destination.iata_code }}</div>
          <div class="text-xs text-gray-500">{{ searchStore.destination.city_name }}</div>
        </div>
      </div>
      <div v-else class="text-4xl mb-6 animate-bounce">✈️</div>

      <h2 class="text-xl font-bold text-gray-900 mb-2">Se caută zboruri...</h2>
      <p class="text-gray-400 text-sm mb-6 min-h-[20px] transition-all duration-500">{{ tips[tipIndex] }}</p>

      <!-- Progress bar -->
      <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
        <div class="bg-brand-600 h-full rounded-full transition-all duration-500"
          :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Dots -->
      <div class="flex justify-center gap-1.5 mb-4">
        <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-brand-400 animate-pulse" :style="`animation-delay: ${i * 0.25}s`"></div>
      </div>

      <!-- Destination fun fact -->
      <div v-if="destFact" class="bg-brand-50 rounded-xl px-4 py-3 text-xs text-brand-700 text-center leading-relaxed">
        {{ destFact }}
      </div>
    </div>
  </div>
</template>
