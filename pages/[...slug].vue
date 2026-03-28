<script setup lang="ts">
const { t } = useI18n()
useHead({ title: `404 — YouFly`, meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const suggestedPages = [
  { path: '/', label: 'nav.search' },
  { path: '/deals', label: 'nav.deals' },
  { path: '/destinations', label: 'nav.destinations' },
  { path: '/my-booking', label: 'nav.myBooking' },
  { path: '/flight-status', label: 'nav.flightStatus' },
  { path: '/contact', label: 'nav.contact' },
]
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="text-center max-w-md">
      <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-brand-50 flex items-center justify-center">
        <svg class="w-12 h-12 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>

      <h1 class="text-5xl font-black text-gray-900 mb-3">404</h1>
      <p class="text-lg text-gray-600 mb-2">{{ t('error404.title') }}</p>
      <p class="text-sm text-gray-400 mb-8">
        {{ t('error404.desc') }}
        <span class="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs ml-1">{{ route.path }}</span>
      </p>

      <NuxtLink to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-lg">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {{ t('error404.searchFlights') }}
      </NuxtLink>

      <div class="mt-10 pt-8 border-t border-gray-100">
        <p class="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">{{ t('error404.suggestions') }}</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <NuxtLink v-for="page in suggestedPages" :key="page.path" :to="page.path"
            class="px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-600 hover:border-brand-400 hover:text-brand-600 transition-colors">
            {{ t(page.label) }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
