<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <div class="text-8xl mb-4">✈️</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ error.statusCode === 404 ? '404' : 'Eroare' }}</h1>
      <p class="text-gray-500 mb-6">{{ error.statusCode === 404 ? 'Pagina nu a fost găsită.' : error.message }}</p>
      <NuxtLink to="/" class="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
        Înapoi acasă
      </NuxtLink>
    </div>
  </div>
</template>
