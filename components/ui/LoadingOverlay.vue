<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
const searchStore = useSearchStore()

const tips = computed(() => [
  t('loadingOverlay.tip1'),
  t('loadingOverlay.tip2'),
  t('loadingOverlay.tip3'),
  t('loadingOverlay.tip4'),
  t('loadingOverlay.tip5'),
  t('loadingOverlay.tip6'),
])

const destFacts = computed((): Record<string, string> => ({
  'IST': t('loadingOverlay.factIST'),
  'BCN': t('loadingOverlay.factBCN'),
  'LTN': t('loadingOverlay.factLTN'),
  'CDG': t('loadingOverlay.factCDG'),
  'VIE': t('loadingOverlay.factVIE'),
  'OTP': t('loadingOverlay.factOTP'),
  'MXP': t('loadingOverlay.factMXP'),
  'TLV': t('loadingOverlay.factTLV'),
  'DXB': t('loadingOverlay.factDXB'),
}))

const destFact = computed(() => {
  const dest = searchStore.destination?.airport_iata || ''
  return destFacts.value[dest] || null
})
const tipIndex = ref(0)
const progress = ref(0)
let tipInterval: ReturnType<typeof setInterval>
let progressInterval: ReturnType<typeof setInterval>

onMounted(() => {
  tipInterval = setInterval(() => {
    tipIndex.value = (tipIndex.value + 1) % tips.value.length
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
  <div role="status" :aria-label="t('loadingOverlay.searching')" class="fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center">
    <!-- Destination photo background -->
    <DestinationPhoto v-if="searchStore.destination"
      :code="searchStore.destination.airport_iata || searchStore.destination.iata_code || ''"
      :width="1200"
      height-class="absolute inset-0 opacity-50" />
    <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/60"></div>

    <div class="text-center max-w-sm px-4 relative z-10">
      <!-- Route display -->
      <div v-if="searchStore.origin && searchStore.destination" class="flex items-center justify-center gap-4 mb-8">
        <div class="text-center">
          <div class="text-3xl font-black text-white">{{ searchStore.origin.airport_iata || searchStore.origin.iata_code }}</div>
          <div class="text-xs text-gray-400">{{ searchStore.origin.city_name }}</div>
        </div>
        <div class="flex-1 flex flex-col items-center min-w-[100px]">
          <svg class="w-8 h-8 text-brand-400 loading-plane" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          <div class="w-full h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent mt-2"></div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-black text-white">{{ searchStore.destination.airport_iata || searchStore.destination.iata_code }}</div>
          <div class="text-xs text-gray-400">{{ searchStore.destination.city_name }}</div>
        </div>
      </div>
      <div v-else aria-hidden="true" class="mb-8">
        <svg class="w-12 h-12 text-brand-400 loading-plane mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
      </div>

      <h2 class="text-xl font-bold text-white mb-2">{{ t('loadingOverlay.searching') }}</h2>
      <p aria-live="polite" aria-atomic="true" class="text-gray-400 text-sm mb-8 min-h-[20px] transition-all duration-500">{{ tips[tipIndex] }}</p>

      <!-- Progress bar -->
      <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-4"
        role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100"
        :aria-valuetext="Math.round(progress) + '%'">
        <div class="bg-brand-500 h-full rounded-full transition-all duration-500"
          :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Dots -->
      <div aria-hidden="true" class="flex justify-center gap-2 mb-6">
        <div v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" :style="`animation-delay: ${i * 0.25}s`"></div>
      </div>

      <!-- Destination fun fact -->
      <div v-if="destFact" class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-gray-300 text-center leading-relaxed backdrop-blur-sm">
        {{ destFact }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes plane-float {
  0%, 100% { transform: translateX(-15px) translateY(0); }
  50% { transform: translateX(15px) translateY(-5px); }
}
.loading-plane {
  animation: plane-float 2s ease-in-out infinite;
  display: inline-block;
}
</style>
