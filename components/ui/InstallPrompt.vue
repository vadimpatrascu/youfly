<script setup lang="ts">
const { t } = useI18n()
const show = ref(false)
const deferredPrompt = ref<any>(null)
const isIos = ref(false)
const isStandalone = ref(false)

onMounted(() => {
  // Check if already installed (standalone)
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true

  if (isStandalone.value) return

  // iOS detection
  const ua = navigator.userAgent
  isIos.value = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream

  // Android/Chrome: listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    // Show prompt after 30 seconds on site (non-intrusive)
    setTimeout(() => {
      if (!localStorage.getItem('youfly_install_dismissed')) {
        show.value = true
      }
    }, 30000)
  })

  // iOS: show manual instruction after 60 seconds
  if (isIos.value && !localStorage.getItem('youfly_install_dismissed')) {
    setTimeout(() => { show.value = true }, 60000)
  }
})

async function install() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      show.value = false
    }
    deferredPrompt.value = null
  }
}

function dismiss() {
  show.value = false
  try { localStorage.setItem('youfly_install_dismissed', '1') } catch {}
}
</script>

<template>
  <Teleport to="body">
    <Transition name="install">
      <div v-if="show && !isStandalone"
        role="alert"
        class="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[100] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/40 p-4 flex items-start gap-3">
        <div aria-hidden="true" class="text-3xl shrink-0">📲</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-white text-sm mb-1">{{ t('install.title') }}</p>
          <p v-if="isIos" class="text-xs text-gray-400 leading-relaxed">
            {{ t('install.descIos1') }}
            <span aria-hidden="true"> ⬆️ </span>
            {{ t('install.descIos2') }}
          </p>
          <p v-else class="text-xs text-gray-400 leading-relaxed">
            {{ t('install.descAndroid') }}
          </p>
          <div class="flex gap-2 mt-3">
            <button v-if="!isIos" @click="install"
              class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors">
              {{ t('install.button') }}
            </button>
            <button @click="dismiss"
              class="px-4 py-2 border border-gray-700 text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
              {{ t('install.dismiss') }}
            </button>
          </div>
        </div>
        <button @click="dismiss" :aria-label="t('common.close')" class="text-gray-500 hover:text-white text-lg leading-none shrink-0">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.install-enter-active, .install-leave-active { transition: all 0.3s ease; }
.install-enter-from { opacity: 0; transform: translateY(20px); }
.install-leave-to { opacity: 0; transform: translateY(20px); }
</style>
