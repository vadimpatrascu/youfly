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
  { key: 'm', desc: t('help.currency') },
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
        <div role="dialog" aria-modal="true" aria-labelledby="help-modal-title" class="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 id="help-modal-title" class="font-bold text-white flex items-center gap-2">
            <svg aria-hidden="true" class="w-4 h-4 text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3m5.25 3.75h.008v.008H8.25V9zm3.75 0h.008v.008H12V9zm3.75 0h.008v.008H15.75V9zm-7.5 3.75h.008v.008H8.25v-.008zm3.75 0h.008v.008H12v-.008zm3.75 0h.008v.008H15.75v-.008z"/></svg>
            {{ t('help.title') }}
          </h3>
            <button ref="closeBtn" @click="show = false" :aria-label="t('common.close')" class="text-gray-500 hover:text-white text-xl leading-none"><span aria-hidden="true">✕</span></button>
          </div>
          <div class="space-y-2">
            <div v-for="s in shortcuts" :key="s.key" class="flex items-center justify-between text-sm">
              <span class="text-gray-400">{{ s.desc }}</span>
              <kbd class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono font-bold text-gray-300">{{ s.key }}</kbd>
            </div>
          </div>
          <p class="mt-4 text-xs text-gray-600 text-center">{{ t('help.hint') }} <kbd class="bg-gray-800 border border-gray-700 rounded px-1 text-gray-400">?</kbd></p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>
