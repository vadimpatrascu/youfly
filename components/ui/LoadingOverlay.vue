<script setup lang="ts">
const { t } = useI18n()
const tips = [
  'Se verifică disponibilitatea...',
  'Se compară prețurile...',
  'Se caută cele mai bune oferte...',
  'Se procesează rezultatele...',
]
const tipIndex = ref(0)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    tipIndex.value = (tipIndex.value + 1) % tips.length
  }, 1200)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
    <div class="text-center">
      <!-- Animated plane -->
      <div class="relative w-32 h-16 mx-auto mb-8">
        <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent"></div>
        <div class="text-5xl animate-bounce inline-block">✈️</div>
      </div>

      <!-- Spinner -->
      <div class="flex justify-center mb-6">
        <div class="w-14 h-14 rounded-full border-4 border-gray-100 border-t-brand-600 animate-spin"></div>
      </div>

      <h2 class="text-xl font-bold text-gray-900 mb-2">Se caută zboruri...</h2>
      <p class="text-gray-400 text-sm h-5 transition-all duration-500">{{ tips[tipIndex] }}</p>

      <!-- Dots -->
      <div class="flex justify-center gap-1.5 mt-5">
        <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-brand-400 animate-pulse" :style="`animation-delay: ${i * 0.2}s`"></div>
      </div>
    </div>
  </div>
</template>
