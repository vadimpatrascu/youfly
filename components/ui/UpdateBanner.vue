<script setup lang="ts">
const { t } = useI18n()
const show = ref(false)

onMounted(() => {
  window.addEventListener('sw-update-available', () => {
    show.value = true
  })
})

function reload() {
  window.location.reload()
}
</script>

<template>
  <Transition name="update">
    <div v-if="show" role="alert"
      class="fixed top-0 left-0 right-0 z-[300] bg-brand-700 text-white text-center py-2.5 px-4 flex items-center justify-center gap-3 text-sm">
      <span>{{ t('common.updateAvailable') }}</span>
      <button @click="reload"
        class="px-3 py-1 bg-white text-brand-700 text-xs font-semibold rounded-lg hover:bg-brand-50 transition-colors">
        {{ t('common.reload') }}
      </button>
      <button @click="show = false" :aria-label="t('common.close')" class="text-white/70 hover:text-white ml-2">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.update-enter-active, .update-leave-active { transition: all 0.3s ease; }
.update-enter-from, .update-leave-to { opacity: 0; transform: translateY(-100%); }
</style>
