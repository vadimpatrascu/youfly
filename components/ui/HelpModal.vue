<script setup lang="ts">
const { t } = useI18n()
const show = ref(false)
const closeBtn = ref<HTMLButtonElement>()
let prevFocus: HTMLElement | null = null

function toggle() { show.value = !show.value }
defineExpose({ toggle })

watch(show, async (val) => {
  if (val) {
    prevFocus = document.activeElement as HTMLElement
    await nextTick()
    closeBtn.value?.focus()
  } else {
    prevFocus?.focus()
    prevFocus = null
  }
})

const shortcuts = computed(() => [
  { key: '/', desc: t('help.search') },
  { key: 'h', desc: t('help.home') },
  { key: 'b', desc: t('help.booking') },
  { key: 'd', desc: t('help.deals') },
  { key: 'Escape', desc: t('help.escape') },
  { key: '?', desc: t('help.help') },
])

onMounted(() => {
  function handler(e: KeyboardEvent) {
    const tgt = e.target as HTMLElement
    if (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA') return
    if (e.key === '?') { e.preventDefault(); show.value = !show.value }
    if (e.key === 'Escape') show.value = false
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50" @click.self="show = false">
        <div role="dialog" aria-modal="true" aria-labelledby="help-modal-title" class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 id="help-modal-title" class="font-bold text-gray-900"><span aria-hidden="true">⌨️</span> {{ t('help.title') }}</h3>
            <button ref="closeBtn" @click="show = false" :aria-label="t('common.close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none"><span aria-hidden="true">✕</span></button>
          </div>
          <div class="space-y-2">
            <div v-for="s in shortcuts" :key="s.key" class="flex items-center justify-between text-sm">
              <span class="text-gray-600">{{ s.desc }}</span>
              <kbd class="bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs font-mono font-bold text-gray-700">{{ s.key }}</kbd>
            </div>
          </div>
          <p class="mt-4 text-xs text-gray-400 text-center">{{ t('help.hint') }} <kbd class="bg-gray-100 border rounded px-1">?</kbd></p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
