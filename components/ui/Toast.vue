<script setup lang="ts">
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
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-orange-50 border-orange-200 text-orange-800',
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
      class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm"
      :class="colors[type || 'info']">
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        :class="iconColors[type || 'info']">
        {{ icons[type || 'info'] }}
      </div>
      <span class="flex-1">{{ message }}</span>
      <button @click="visible = false; $nextTick(() => emit('close'))" class="shrink-0 opacity-50 hover:opacity-100 text-lg leading-none mt-0.5">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(60px); }
.toast-leave-to { opacity: 0; transform: translateX(60px); }
</style>
