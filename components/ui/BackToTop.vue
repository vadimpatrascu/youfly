<script setup lang="ts">
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
    <div class="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
      <div class="h-full bg-brand-500 transition-all duration-100"
        :style="`width: ${progress}%`"></div>
    </div>

    <!-- Back to top button -->
    <Transition name="fade-up">
      <button v-if="show" @click="scrollToTop"
        class="fixed bottom-20 md:bottom-6 right-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all"
        title="Înapoi sus">
        ↑
      </button>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-up-enter-active, .fade-up-leave-active { transition: all 0.2s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
