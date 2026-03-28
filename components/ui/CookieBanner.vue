<script setup lang="ts">
const { t } = useI18n()
const COOKIE_KEY = 'youfly_cookie_consent'
const show = ref(false)
const showCustomize = ref(false)
const acceptBtn = ref<HTMLButtonElement>()
let prevFocus: HTMLElement | null = null

const consent = reactive({
  essential: true, // always on
  analytics: true,
  preferences: true,
})

onMounted(() => {
  try {
    const saved = localStorage.getItem(COOKIE_KEY)
    if (!saved) {
      show.value = true
    }
  } catch {}
})

watch(show, async (val) => {
  if (val) {
    prevFocus = document.activeElement as HTMLElement
    await nextTick()
    acceptBtn.value?.focus()
  } else {
    prevFocus?.focus()
    prevFocus = null
  }
})

function acceptAll() {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ essential: true, analytics: true, preferences: true })) } catch {}
  show.value = false
}

function acceptEssential() {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ essential: true, analytics: false, preferences: false })) } catch {}
  show.value = false
}

function saveCustom() {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...consent })) } catch {}
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie">
      <div v-if="show"
        role="dialog" :aria-label="t('cookie.bannerLabel')" aria-modal="true"
        aria-describedby="cookie-banner-desc"
        class="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/40 p-4">
        <p id="cookie-banner-desc" class="text-sm text-gray-300 mb-3 leading-relaxed">
          {{ t('cookie.textBefore') }}
          <NuxtLink to="/privacy" class="text-brand-400 underline">{{ t('cookie.linkText') }}</NuxtLink>.
        </p>

        <!-- Customize panel -->
        <div v-if="showCustomize" class="mb-3 space-y-2 bg-gray-800/50 rounded-xl p-3">
          <label class="flex items-center justify-between text-sm">
            <span class="text-gray-400">{{ t('cookie.essential') }}</span>
            <input type="checkbox" checked disabled class="rounded border-gray-600 text-brand-600" />
          </label>
          <label class="flex items-center justify-between text-sm cursor-pointer">
            <span class="text-gray-300">{{ t('cookie.analytics') }}</span>
            <input v-model="consent.analytics" type="checkbox" class="rounded border-gray-600 text-brand-600 focus:ring-brand-500" />
          </label>
          <label class="flex items-center justify-between text-sm cursor-pointer">
            <span class="text-gray-300">{{ t('cookie.preferences') }}</span>
            <input v-model="consent.preferences" type="checkbox" class="rounded border-gray-600 text-brand-600 focus:ring-brand-500" />
          </label>
          <button @click="saveCustom" class="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg transition-colors mt-2">
            {{ t('cookie.savePreferences') }}
          </button>
        </div>

        <div class="flex gap-2">
          <button ref="acceptBtn" @click="acceptAll"
            class="flex-1 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-colors">
            {{ t('cookie.accept') }}
          </button>
          <button @click="acceptEssential"
            class="px-3 py-2 border border-gray-700 text-gray-400 text-sm rounded-xl hover:bg-gray-800 transition-colors">
            {{ t('cookie.decline') }}
          </button>
          <button v-if="!showCustomize" @click="showCustomize = true"
            class="px-3 py-2 text-gray-500 text-xs hover:text-gray-300 transition-colors">
            {{ t('cookie.customize') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cookie-enter-active, .cookie-leave-active { transition: all 0.3s ease; }
.cookie-enter-from, .cookie-leave-to { transform: translateY(100%); opacity: 0; }
</style>
