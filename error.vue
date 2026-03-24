<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
const { t } = useI18n()
const handleError = () => clearError({ redirect: '/' })
const is404 = computed(() => props.error.statusCode === 404)

useHead(computed(() => ({
  title: `${props.error.statusCode} — YouFly`,
  meta: [{ name: 'robots', content: 'noindex' }],
})))
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
    <!-- Destination scene background -->
    <DestinationPhoto code="CDG" :width="1200" height-class="absolute inset-0 opacity-20" />
    <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/60"></div>
    <!-- Ambient glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" aria-hidden="true"></div>
    <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" aria-hidden="true"></div>

    <div class="max-w-md relative z-10" style="animation: fadeIn 0.6s ease both">
      <!-- Animated plane icon for 404 -->
      <div v-if="is404" aria-hidden="true" class="mb-8">
        <div class="relative inline-block">
          <svg class="w-20 h-20 text-brand-400 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-brand-500/20 rounded-full blur-sm"></div>
        </div>
      </div>
      <div v-else aria-hidden="true" class="mb-8">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
      </div>

      <h1 class="text-8xl font-black text-brand-500 mb-4 tracking-tighter" style="animation: fadeIn 0.6s ease 0.1s both">{{ error.statusCode }}</h1>
      <h2 class="text-2xl font-bold text-white mb-3" style="animation: fadeIn 0.6s ease 0.2s both">
        {{ is404 ? t('error.notFoundTitle') : t('error.errorTitle') }}
      </h2>
      <p class="text-gray-500 mb-10 leading-relaxed" style="animation: fadeIn 0.6s ease 0.3s both">
        {{ is404
          ? t('error.notFoundDesc')
          : error.message || t('error.errorDesc') }}
      </p>
      <div class="flex gap-3 justify-center flex-wrap" style="animation: fadeIn 0.6s ease 0.4s both">
        <button @click="handleError"
          class="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 glow-brand">
          <svg class="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
          {{ t('error.backToSearch') }}
        </button>
        <NuxtLink to="/contact"
          class="px-8 py-3 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition-colors">
          {{ t('error.contactUs') }}
        </NuxtLink>
      </div>
      <!-- Quick links for 404 -->
      <div v-if="is404" class="mt-8 flex gap-2 flex-wrap justify-center" style="animation: fadeIn 0.6s ease 0.5s both">
        <NuxtLink v-for="link in [
          { to: '/destinations', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: t('nav.destinations') },
          { to: '/deals', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', label: t('nav.deals') },
          { to: '/blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', label: t('nav.blog') },
          { to: '/faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: t('nav.faq') },
        ]" :key="link.to" :to="link.to"
          class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 hover:border-white/20">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" :d="link.icon"/></svg>
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
    <p class="mt-12 text-xs text-gray-700">&copy; {{ new Date().getFullYear() }} YouFly</p>
  </div>
</template>
