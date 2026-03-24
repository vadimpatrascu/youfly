<script setup lang="ts">
const { t } = useI18n()
const isOffline = ref(false)

onMounted(() => {
  isOffline.value = !navigator.onLine
  window.addEventListener('online', () => { isOffline.value = false })
  window.addEventListener('offline', () => { isOffline.value = true })
})
</script>

<template>
  <Transition name="offline">
    <div v-if="isOffline" role="alert" aria-live="assertive"
      class="fixed top-0 left-0 right-0 z-[300] bg-gray-800 text-white text-center text-sm py-2 px-4">
      <span aria-hidden="true">📡</span> {{ t('offline.message') }}
    </div>
  </Transition>
</template>

<style scoped>
.offline-enter-active, .offline-leave-active { transition: all 0.3s ease; }
.offline-enter-from, .offline-leave-to { opacity: 0; transform: translateY(-100%); }
</style>
