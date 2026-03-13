<script setup lang="ts">
const COOKIE_KEY = 'youfly_cookie_consent'
const show = ref(false)

onMounted(() => {
  try {
    if (!localStorage.getItem(COOKIE_KEY)) show.value = true
  } catch {}
})

function accept() {
  try { localStorage.setItem(COOKIE_KEY, 'accepted') } catch {}
  show.value = false
}

function decline() {
  try { localStorage.setItem(COOKIE_KEY, 'declined') } catch {}
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie">
      <div v-if="show"
        class="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4">
        <p class="text-sm text-gray-700 mb-3 leading-relaxed">
          🍪 Folosim cookie-uri pentru a îmbunătăți experiența ta. Prin continuare, accepți
          <NuxtLink to="/privacy" class="text-brand-600 underline">politica de confidențialitate</NuxtLink>.
        </p>
        <div class="flex gap-2">
          <button @click="accept"
            class="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Accept
          </button>
          <button @click="decline"
            class="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
            Refuz
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
