<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()

const langNames: Record<string, string> = { ro: 'RO', ru: 'RU', en: 'EN' }
const showLangMenu = ref(false)

async function switchLocale(code: string) {
  await setLocale(code)
  showLangMenu.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-brand-600">✈ YouFly</span>
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden sm:block">{{ t('nav.search') }}</NuxtLink>
          <NuxtLink to="/my-booking" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden sm:block">{{ t('nav.myBooking') }}</NuxtLink>

          <!-- Language switcher -->
          <div class="relative">
            <button
              @click="showLangMenu = !showLangMenu"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🌐 {{ langNames[locale] || locale.toUpperCase() }}
              <span class="text-gray-400 text-xs">▾</span>
            </button>
            <div v-if="showLangMenu" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[120px]">
              <button
                v-for="loc in locales"
                :key="loc.code"
                @click="switchLocale(loc.code)"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors flex items-center gap-2"
                :class="locale === loc.code ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'"
              >
                <span v-if="locale === loc.code" class="text-brand-600">✓</span>
                <span v-else class="w-4"></span>
                {{ loc.name }}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="bg-white border-t border-gray-200 py-8 mt-auto">
      <div class="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
        © {{ new Date().getFullYear() }} YouFly. {{ t('footer.rights') }}
      </div>
    </footer>
  </div>
</template>
