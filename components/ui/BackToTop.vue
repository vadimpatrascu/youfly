<script setup lang="ts">
const { t } = useI18n()
const show = ref(false)
const progress = ref(0)

function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  show.value = scrollTop > 400
  progress.value = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Teleport to="body">
    <!-- Scroll progress bar -->
    <div role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="progress + '%'" :aria-label="t('common.readingProgress')" class="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
      <div class="h-full bg-brand-500 transition-all duration-100"
        :style="`width: ${progress}%`"></div>
    </div>

    <!-- Back to top button with circular progress ring -->
    <Transition name="fade-up">
      <button v-if="show" @click="scrollToTop"
        class="fixed bottom-20 md:bottom-6 right-4 z-40 w-11 h-11 rounded-full shadow-lg shadow-black/30 flex items-center justify-center text-gray-400 hover:text-white transition-all group"
        :title="t('common.backToTop')" :aria-label="t('common.backToTop')">
        <!-- Progress ring -->
        <svg class="absolute inset-0 w-11 h-11 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="20" fill="#111827" stroke="#374151" stroke-width="2" class="group-hover:fill-brand-600 transition-colors" />
          <circle cx="22" cy="22" r="20" fill="none" stroke="#0ea5e9" stroke-width="2.5"
            stroke-linecap="round"
            :stroke-dasharray="125.6"
            :stroke-dashoffset="125.6 - (125.6 * progress / 100)"
            class="transition-all duration-100" />
        </svg>
        <svg class="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
      </button>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.2s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
