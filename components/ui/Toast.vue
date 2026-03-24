<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}>()

const emit = defineEmits<{ close: [] }>()
const visible = ref(true)

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const colors: Record<string, string> = {
  success: 'bg-gray-900 border-green-700/30 text-green-300',
  error: 'bg-gray-900 border-red-700/30 text-red-300',
  info: 'bg-gray-900 border-blue-700/30 text-blue-300',
  warning: 'bg-gray-900 border-orange-700/30 text-orange-300',
}

const iconColors: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
}

onMounted(() => {
  const timeout = props.duration ?? 4000
  if (timeout > 0) {
    setTimeout(() => {
      visible.value = false
      setTimeout(() => emit('close'), 300)
    }, timeout)
  }
})
</script>

<template>
  <Transition name="toast">
    <div v-if="visible"
      role="alert"
      aria-live="polite"
      class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm"
      :class="colors[type || 'info']">
      <div aria-hidden="true" class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
        :class="iconColors[type || 'info']">
        <svg v-if="type === 'success'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <svg v-else-if="type === 'error'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        <svg v-else-if="type === 'warning'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01"/></svg>
        <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <span class="flex-1">{{ message }}</span>
      <button @click="visible = false; $nextTick(() => emit('close'))" :aria-label="t('common.close')" class="shrink-0 opacity-50 hover:opacity-100 text-lg leading-none mt-0.5"><span aria-hidden="true">×</span></button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(60px); }
.toast-leave-to { opacity: 0; transform: translateX(60px); }
</style>
