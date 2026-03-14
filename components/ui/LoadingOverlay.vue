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
  <div role="status" :aria-label="t('loadingOverlay.searching')" class="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
    <div class="text-center max-w-sm px-4">
      <!-- Route display -->
      <div v-if="searchStore.origin && searchStore.destination" class="flex items-center justify-center gap-3 mb-6">
        <div class="text-center">
          <div class="text-2xl font-black text-gray-900">{{ searchStore.origin.airport_iata || searchStore.origin.iata_code }}</div>
          <div class="text-xs text-gray-500">{{ searchStore.origin.city_name }}</div>
        </div>
        <div class="flex-1 flex flex-col items-center min-w-[80px]">
          <div aria-hidden="true" class="text-2xl animate-bounce">✈️</div>
          <div class="w-full h-px bg-gradient-to-r from-brand-200 via-brand-500 to-brand-200 mt-1"></div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-black text-gray-900">{{ searchStore.destination.airport_iata || searchStore.destination.iata_code }}</div>
          <div class="text-xs text-gray-500">{{ searchStore.destination.city_name }}</div>
        </div>
      </div>
      <div v-else aria-hidden="true" class="text-4xl mb-6 animate-bounce">✈️</div>

      <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('loadingOverlay.searching') }}</h2>
      <p aria-live="polite" aria-atomic="true" class="text-gray-400 text-sm mb-6 min-h-[20px] transition-all duration-500">{{ tips[tipIndex] }}</p>

      <!-- Progress bar -->
      <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3"
        role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100"
        :aria-valuetext="Math.round(progress) + '%'">
        <div class="bg-brand-600 h-full rounded-full transition-all duration-500"
          :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Dots -->
      <div aria-hidden="true" class="flex justify-center gap-1.5 mb-4">
        <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-brand-400 animate-pulse" :style="`animation-delay: ${i * 0.25}s`"></div>
      </div>

      <!-- Destination fun fact -->
      <div v-if="destFact" class="bg-brand-50 rounded-xl px-4 py-3 text-xs text-brand-700 text-center leading-relaxed">
        {{ destFact }}
      </div>
    </div>
  </div>
</template>
