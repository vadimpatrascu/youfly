<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const { toasts, remove } = useToast()
const { showMdl, toggleCurrency } = useCurrency()
const router = useRouter()

// Keep html lang attribute in sync with selected locale
useHead(computed(() => ({ htmlAttrs: { lang: locale.value } })))

const langNames: Record<string, string> = { ro: 'RO', ru: 'RU', en: 'EN' }
const showLangMenu = ref(false)
const showMobileMenu = ref(false)
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
  await setLocale(code as any)
  showLangMenu.value = false
}

// Airline partner logos from Duffel CDN
const airlineLogos = [
  { iata: 'W6', name: 'Wizz Air' },
  { iata: 'TK', name: 'Turkish Airlines' },
  { iata: 'RO', name: 'TAROM' },
  { iata: 'OS', name: 'Austrian Airlines' },
  { iata: 'LO', name: 'LOT Polish Airlines' },
  { iata: 'LH', name: 'Lufthansa' },
  { iata: '5F', name: 'FlyOne' },
  { iata: 'H4', name: 'HiSky' },
  { iata: 'FZ', name: 'flydubai' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans">
    <NuxtLoadingIndicator color="#0284c7" :height="2" />
    <!-- Skip navigation link for keyboard/screen reader users -->
    <a href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg">
      {{ t('nav.skipToContent') }}
    </a>

    <!-- Top info bar (inspired by sky.md) -->
    <div class="bg-brand-700 text-white text-xs py-1.5 px-4 hidden sm:block">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a :href="`tel:${t('footer.phone')}`" class="flex items-center gap-1.5 hover:text-brand-200 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {{ t('footer.phone') }}
          </a>
          <span class="text-brand-300">|</span>
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-green-300" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg>
            {{ t('nav.support247') }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/my-booking" class="hover:text-brand-200 transition-colors flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {{ t('nav.myBooking') }}
          </NuxtLink>
          <span class="text-brand-300">|</span>
          <NuxtLink to="/contact" class="hover:text-brand-200 transition-colors">{{ t('nav.contact') }}</NuxtLink>
        </div>
      </div>
    </div>

    <header role="banner" class="bg-gray-950 border-b border-gray-800/50 sticky top-0 z-50 transition-shadow duration-200"
      :class="scrolled ? 'shadow-lg shadow-black/30' : ''">
      <div class="max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-200"
        :class="scrolled ? 'h-14' : 'h-16'">
        <NuxtLink to="/" class="flex items-center gap-2" aria-label="YouFly">
          <div class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          </div>
          <span class="font-black tracking-tight transition-all duration-200" :class="scrolled ? 'text-lg' : 'text-xl'" aria-hidden="true">
            <span class="text-brand-400">You</span><span class="text-white">Fly</span>
          </span>
        </NuxtLink>
        <nav :aria-label="t('nav.mainNav')" class="flex items-center gap-1 md:gap-3">
          <NuxtLink to="/" class="nav-link text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5">{{ t('nav.search') }}</NuxtLink>
          <NuxtLink to="/destinations" class="nav-link text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5">{{ t('nav.destinations') }}</NuxtLink>
          <NuxtLink to="/deals" class="nav-link text-sm font-medium text-red-400 hover:text-red-300 transition-colors hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-500/10 font-semibold">
            <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
            {{ t('nav.deals') }}
          </NuxtLink>
          <NuxtLink to="/blog" class="nav-link text-sm font-medium text-gray-400 hover:text-white transition-colors hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5">{{ t('nav.blog') }}</NuxtLink>
          <NuxtLink to="/faq" class="nav-link text-sm font-medium text-gray-400 hover:text-white transition-colors hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/5">FAQ</NuxtLink>

          <div class="w-px h-6 bg-gray-800 mx-1 hidden sm:block"></div>

          <!-- MDL toggle -->
          <button @click="toggleCurrency"
            class="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
            :class="showMdl ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'"
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
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {{ langNames[locale] || locale.toUpperCase() }}
              <svg class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div v-if="showLangMenu" role="listbox" :aria-label="t('nav.switchLanguage')" class="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 min-w-[120px]">
              <button
                v-for="loc in locales"
                :key="loc.code"
                @click="switchLocale(loc.code)"
                role="option"
                :aria-selected="locale === loc.code"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                :class="locale === loc.code ? 'text-brand-400 font-semibold bg-gray-800' : 'text-gray-300'"
              >
                <span aria-hidden="true" v-if="locale === loc.code" class="text-brand-400">✓</span>
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

    <!-- PWA install prompt -->
    <InstallPrompt />

    <!-- Offline indicator -->
    <OfflineBanner />

    <!-- SW update notification -->
    <UpdateBanner />

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
    <nav :aria-label="t('nav.mobileNav')" class="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800/50 z-40 md:hidden pb-safe">
      <div class="flex">
        <NuxtLink to="/" class="mobile-nav-item flex-1 flex flex-col items-center py-2.5 text-gray-500 hover:text-white transition-colors active:scale-95">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span class="text-[10px] mt-0.5 font-medium">{{ t('nav.search') }}</span>
        </NuxtLink>
        <NuxtLink to="/deals" class="mobile-nav-item flex-1 flex flex-col items-center py-2.5 text-gray-500 hover:text-white transition-colors active:scale-95">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>
          <span class="text-[10px] mt-0.5 font-medium">{{ t('nav.deals') }}</span>
        </NuxtLink>
        <NuxtLink to="/my-booking" class="mobile-nav-item flex-1 flex flex-col items-center py-2.5 text-gray-500 hover:text-white transition-colors active:scale-95">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span class="text-[10px] mt-0.5 font-medium">{{ t('nav.myBooking') }}</span>
        </NuxtLink>
        <NuxtLink to="/destinations" class="mobile-nav-item flex-1 flex flex-col items-center py-2.5 text-gray-500 hover:text-white transition-colors active:scale-95">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="text-[10px] mt-0.5 font-medium">{{ t('nav.destinations') }}</span>
        </NuxtLink>
      </div>
    </nav>
    <!-- Spacer for mobile bottom nav (including safe area) -->
    <div class="h-14 md:hidden pb-safe"></div>

    <footer role="contentinfo" class="relative bg-gray-950 text-white mt-auto overflow-hidden">
      <!-- Subtle skyline background -->
      <DestinationPhoto code="BCN" :width="1200" height-class="absolute inset-0 opacity-10" :no-animation="true" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/95 to-gray-950/80"></div>
      <!-- Flight path arc -->
      <svg class="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-50,300 Q400,50 700,150 Q1000,250 1250,30" fill="none" stroke="white" stroke-width="1" class="flight-path" />
      </svg>
      <div class="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-8">
        <!-- Airline partners strip (sky.md style) -->
        <div class="mb-10 pb-8 border-b border-gray-800/50">
          <p class="text-xs text-gray-500 text-center mb-5 uppercase tracking-widest font-medium">{{ t('index.trustedPartner') }}</p>
          <div :aria-label="t('index.airlinesLabel')" class="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            <div v-for="airline in airlineLogos" :key="airline.iata"
              class="group relative">
              <img :src="`https://assets.duffel.com/img/airlines/for-dark-background/${airline.iata}.svg`"
                :alt="airline.name"
                class="h-6 md:h-7 w-auto opacity-40 group-hover:opacity-80 transition-opacity duration-300 grayscale group-hover:grayscale-0"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display = 'none'" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <!-- Brand -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              </div>
              <span class="text-2xl font-black"><span class="text-brand-400">You</span><span class="text-white">Fly</span></span>
            </div>
            <p class="text-sm text-gray-400 leading-relaxed mb-4">{{ t('footer.tagline') }}</p>
            <!-- Trust badges -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 font-medium">IATA Accredited</span>
              <span class="text-[10px] bg-brand-500/10 text-brand-300 px-2 py-1 rounded-full border border-brand-500/20 font-medium">SSL Secure</span>
            </div>
          </div>
          <!-- Explore -->
          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">{{ t('footer.links') }}</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li><NuxtLink to="/" class="hover:text-white transition-colors">{{ t('nav.search') }}</NuxtLink></li>
              <li><NuxtLink to="/destinations" class="hover:text-white transition-colors">{{ t('nav.destinations') }}</NuxtLink></li>
              <li><NuxtLink to="/deals" class="hover:text-white transition-colors">{{ t('nav.deals') }}</NuxtLink></li>
              <li><NuxtLink to="/airports" class="hover:text-white transition-colors">{{ t('nav.airports') }}</NuxtLink></li>
              <li><NuxtLink to="/blog" class="hover:text-white transition-colors">{{ t('nav.blog') }}</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white transition-colors">{{ t('nav.about') }}</NuxtLink></li>
            </ul>
          </div>
          <!-- Resources -->
          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">{{ t('index.resources') }}</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li><NuxtLink to="/my-booking" class="hover:text-white transition-colors">{{ t('footer.myBooking') }}</NuxtLink></li>
              <li><NuxtLink to="/flight-status" class="hover:text-white transition-colors">{{ t('nav.flightStatus') }}</NuxtLink></li>
              <li><NuxtLink to="/checkin" class="hover:text-white transition-colors">{{ t('nav.checkin') }}</NuxtLink></li>
              <li><NuxtLink to="/luggage" class="hover:text-white transition-colors">{{ t('nav.luggage') }}</NuxtLink></li>
              <li><NuxtLink to="/visa" class="hover:text-white transition-colors">{{ t('nav.visa') }}</NuxtLink></li>
              <li><NuxtLink to="/faq" class="hover:text-white transition-colors">{{ t('nav.faq') }}</NuxtLink></li>
            </ul>
          </div>
          <!-- Contact -->
          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">{{ t('footer.contact') }}</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li>
                <a :href="`tel:${t('footer.phone')}`" class="hover:text-white transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {{ t('footer.phone') }}
                </a>
              </li>
              <li>
                <a :href="`mailto:${t('footer.email')}`" class="hover:text-white transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {{ t('footer.email') }}
                </a>
              </li>
              <li><NuxtLink to="/contact" class="hover:text-white transition-colors">{{ t('nav.contact') }}</NuxtLink></li>
            </ul>
            <!-- Social media -->
            <div class="flex gap-2 mt-4">
              <a v-for="social in [
                { label: 'Instagram', href: '#', svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { label: 'Telegram', href: '#', svg: 'M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
                { label: 'WhatsApp', href: '#', svg: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' },
              ]" :key="social.label" :href="social.href" :aria-label="social.label"
                class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors group">
                <svg class="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path :d="social.svg"/></svg>
              </a>
            </div>
            <div class="mt-6 flex gap-3 text-xs text-gray-500">
              <NuxtLink to="/terms" class="hover:text-gray-300 transition-colors">{{ t('footer.terms') }}</NuxtLink>
              <span>·</span>
              <NuxtLink to="/privacy" class="hover:text-gray-300 transition-colors">{{ t('footer.privacy') }}</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Payment methods (sky.md style - more professional) -->
        <div class="border-t border-gray-800/50 pt-6 mb-6">
          <div class="flex items-center justify-center gap-4 flex-wrap">
            <span class="text-xs text-gray-600 mr-2">{{ t('footer.accepted') }}</span>
            <div class="flex items-center gap-2">
              <span class="bg-white text-gray-900 px-3 py-1.5 rounded-md text-xs font-black tracking-wide">VISA</span>
              <span class="bg-white text-gray-900 px-3 py-1.5 rounded-md text-xs font-black tracking-wide">Mastercard</span>
              <span class="bg-white text-gray-900 px-3 py-1.5 rounded-md text-xs font-black tracking-wide">AMEX</span>
              <span class="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-3 py-1.5 rounded-md text-xs font-bold tracking-wide">YouFly Pay</span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {{ new Date().getFullYear() }} YouFly. {{ t('footer.rights') }}</span>
          <div class="flex items-center gap-4">
            <span class="text-gray-700 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Chișinău, Moldova
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Active state for mobile bottom nav */
.mobile-nav-item.router-link-exact-active {
  color: #38bdf8;
  font-weight: 600;
}
/* Active state for desktop nav */
.nav-link.router-link-exact-active {
  color: #0ea5e9;
  font-weight: 600;
  background: rgba(14, 165, 233, 0.08);
}
</style>
