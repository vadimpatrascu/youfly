<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
const { t } = useI18n()
const handleError = () => clearError({ redirect: '/' })
const is404 = computed(() => props.error.statusCode === 404)
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
    <div class="max-w-md">
      <div aria-hidden="true" class="text-8xl mb-6">{{ is404 ? '🗺️' : '⚠️' }}</div>
      <h1 class="text-7xl font-black text-brand-600 mb-3">{{ error.statusCode }}</h1>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">
        {{ is404 ? t('error.notFoundTitle') : t('error.errorTitle') }}
      </h2>
      <p class="text-gray-500 mb-8 leading-relaxed">
        {{ is404
          ? t('error.notFoundDesc')
          : error.message || t('error.errorDesc') }}
      </p>
      <div class="flex gap-3 justify-center flex-wrap">
        <button @click="handleError"
          class="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg">
          <span aria-hidden="true">✈</span> {{ t('error.backToSearch') }}
        </button>
        <NuxtLink to="/contact"
          class="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
          {{ t('error.contactUs') }}
        </NuxtLink>
      </div>
    </div>
    <p class="mt-12 text-xs text-gray-400">© {{ new Date().getFullYear() }} YouFly</p>
  </div>
</template>
