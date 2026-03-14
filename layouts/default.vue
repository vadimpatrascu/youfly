<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const { toasts, remove } = useToast()
const { showMdl, toggleCurrency } = useCurrency()
const router = useRouter()

// Keep html lang attribute in sync with selected locale
useHead(computed(() => ({ htmlAttrs: { lang: locale.value } })))

const langNames: Record<string, string> = { ro: 'RO', ru: 'RU', en: 'EN' }
const showLangMenu = ref(false)
const scrolled = ref(false)
const langMenuRef = ref<HTMLDivElement>()
const langToggleBtn = ref<HTMLButtonElement>()
onClickOutside(langMenuRef, () => { showLangMenu.value = false })

watch(showLangMenu, async (val) => {
  if (!val) { await nextTick(); langToggleBtn.value?.focus() }
})

// Global navigation keyboard shortcuts
onMounted(() => {
  function handler(e: KeyboardEvent) {
    const tgt = e.target as HTMLElement
    if (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.tagName === 'SELECT' || tgt.isContentEditable) return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === '/') {
      e.preventDefault()
      const searchInput = document.querySelector<HTMLInputElement>('input[type="text"][placeholder]')
      if (searchInput) searchInput.focus()
      else router.push('/')
    }
    if (e.key === 'h') { e.preventDefault(); router.push('/') }
    if (e.key === 'b') { e.preventDefault(); router.push('/my-booking') }
    if (e.key === 'd') { e.preventDefault(); router.push('/deals') }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})

function onLangKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { showLangMenu.value = false }
}

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

async function switchLocale(code: string) {
  await setLocale(code)
  showLangMenu.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans">
    <!-- Skip navigation link for keyboard/screen reader users -->
    <a href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg">
      {{ t('nav.skipToContent') }}
    </a>
    <header role="banner" class="bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-200"
      :class="scrolled ? 'shadow-md' : ''">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-200"
        :class="scrolled ? 'h-14' : 'h-16'">
        <NuxtLink to="/" class="flex items-center gap-2" aria-label="YouFly">
          <span class="text-2xl font-bold text-brand-600" aria-hidden="true">✈ YouFly</span>
        </NuxtLink>
        <nav :aria-label="t('nav.mainNav')" class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden sm:block">{{ t('nav.search') }}</NuxtLink>
          <NuxtLink to="/my-booking" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden sm:block">{{ t('nav.myBooking') }}</NuxtLink>
          <NuxtLink to="/destinations" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden md:block">{{ t('nav.destinations') }}</NuxtLink>
          <NuxtLink to="/deals" class="text-sm font-medium text-red-600 hover:text-red-700 transition-colors hidden md:block font-semibold"><span aria-hidden="true">🔥</span> {{ t('nav.deals') }}</NuxtLink>
          <NuxtLink to="/blog" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden md:block">{{ t('nav.blog') }}</NuxtLink>
          <NuxtLink to="/faq" class="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors hidden md:block">{{ t('nav.faq') }}</NuxtLink>

          <!-- MDL toggle -->
          <button @click="toggleCurrency"
            class="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
            :class="showMdl ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
            :title="t('nav.switchCurrency')"
            :aria-label="t('nav.switchCurrency')">
            {{ showMdl ? 'MDL' : 'EUR' }}
          </button>

          <!-- Language switcher -->
          <div class="relative" ref="langMenuRef" @keydown="onLangKeydown">
            <button
              ref="langToggleBtn"
              @click="showLangMenu = !showLangMenu"
              :aria-expanded="showLangMenu"
              aria-haspopup="listbox"
              :aria-label="t('nav.switchLanguage')"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span aria-hidden="true">🌐</span> {{ langNames[locale] || locale.toUpperCase() }}
              <span aria-hidden="true" class="text-gray-400 text-xs">▾</span>
            </button>
            <div v-if="showLangMenu" role="listbox" :aria-label="t('nav.switchLanguage')" class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[120px]">
              <button
                v-for="loc in locales"
                :key="loc.code"
                @click="switchLocale(loc.code)"
                role="option"
                :aria-selected="locale === loc.code"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors flex items-center gap-2"
                :class="locale === loc.code ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'"
              >
                <span aria-hidden="true" v-if="locale === loc.code" class="text-brand-600">✓</span>
                <span aria-hidden="true" v-else class="w-4"></span>
                {{ loc.name }}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="flex-1" id="main-content">
      <slot />
    </main>

    <!-- Cookie consent banner -->
    <CookieBanner />

    <!-- Back to top + scroll progress -->
    <BackToTop />

    <!-- Keyboard shortcuts help modal -->
    <HelpModal />

    <!-- Toast notifications -->
    <Teleport to="body">
      <div class="fixed top-20 right-4 z-[200] space-y-2 pointer-events-none">
        <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto">
          <Toast :message="toast.message" :type="toast.type" :duration="toast.duration" @close="remove(toast.id)" />
        </div>
      </div>
    </Teleport>

    <!-- Mobile bottom nav -->
    <nav :aria-label="t('nav.mobileNav')" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div class="flex">
        <NuxtLink to="/" class="flex-1 flex flex-col items-center py-3 text-gray-500 hover:text-brand-600 transition-colors">
          <span aria-hidden="true" class="text-xl">&#9992;</span>
          <span class="text-xs mt-0.5">{{ t('nav.search') }}</span>
        </NuxtLink>
        <NuxtLink to="/deals" class="flex-1 flex flex-col items-center py-3 text-red-500 hover:text-red-600 transition-colors">
          <span aria-hidden="true" class="text-xl">🔥</span>
          <span class="text-xs mt-0.5 font-semibold">{{ t('nav.deals') }}</span>
        </NuxtLink>
        <NuxtLink to="/my-booking" class="flex-1 flex flex-col items-center py-3 text-gray-500 hover:text-brand-600 transition-colors">
          <span aria-hidden="true" class="text-xl">&#128196;</span>
          <span class="text-xs mt-0.5">{{ t('nav.myBooking') }}</span>
        </NuxtLink>
      </div>
    </nav>
    <div class="h-14 md:hidden"></div>

    <footer role="contentinfo" class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-6xl mx-auto px-4 py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Brand -->
          <div>
            <div class="text-xl font-bold text-brand-600 mb-2"><span aria-hidden="true">✈</span> YouFly</div>
            <p class="text-sm text-gray-500 leading-relaxed">{{ t('footer.tagline') }}</p>
            <div class="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span>{{ t('footer.powered') }}</span>
            </div>
          </div>
          <!-- Links -->
          <div>
            <h4 class="text-sm font-semibold text-gray-800 mb-3">{{ t('footer.links') }}</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li><NuxtLink to="/" class="hover:text-brand-600 transition-colors">{{ t('nav.search') }}</NuxtLink></li>
              <li><NuxtLink to="/my-booking" class="hover:text-brand-600 transition-colors">{{ t('footer.myBooking') }}</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-brand-600 transition-colors">{{ t('nav.about') }}</NuxtLink></li>
              <li><NuxtLink to="/blog" class="hover:text-brand-600 transition-colors">{{ t('nav.blog') }}</NuxtLink></li>
              <li><NuxtLink to="/faq" class="hover:text-brand-600 transition-colors">{{ t('nav.faq') }}</NuxtLink></li>
              <li><NuxtLink to="/flight-status" class="hover:text-brand-600 transition-colors">{{ t('nav.flightStatus') }}</NuxtLink></li>
              <li><NuxtLink to="/checkin" class="hover:text-brand-600 transition-colors">{{ t('nav.checkin') }}</NuxtLink></li>
              <li><NuxtLink to="/luggage" class="hover:text-brand-600 transition-colors">{{ t('nav.luggage') }}</NuxtLink></li>
              <li><NuxtLink to="/visa" class="hover:text-brand-600 transition-colors">{{ t('nav.visa') }}</NuxtLink></li>
              <li><NuxtLink to="/airports" class="hover:text-brand-600 transition-colors">{{ t('nav.airports') }}</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-brand-600 transition-colors">{{ t('nav.contact') }}</NuxtLink></li>
              <li><NuxtLink to="/terms" class="hover:text-brand-600 transition-colors">{{ t('footer.terms') }}</NuxtLink></li>
              <li><NuxtLink to="/privacy" class="hover:text-brand-600 transition-colors">{{ t('footer.privacy') }}</NuxtLink></li>
            </ul>
          </div>
          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold text-gray-800 mb-3">{{ t('footer.contact') }}</h4>
            <ul class="space-y-2 text-sm text-gray-500">
              <li class="flex items-center gap-2"><span aria-hidden="true">📞</span> <a :href="`tel:${t('footer.phone')}`" class="hover:text-brand-600 transition-colors">{{ t('footer.phone') }}</a></li>
              <li class="flex items-center gap-2"><span aria-hidden="true">✉️</span> <a :href="`mailto:${t('footer.email')}`" class="hover:text-brand-600 transition-colors">{{ t('footer.email') }}</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {{ new Date().getFullYear() }} YouFly. {{ t('footer.rights') }}
        </div>
      </div>
    </footer>
  </div>
</template>
