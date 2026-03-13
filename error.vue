<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="text-8xl mb-6">
        <span v-if="error.statusCode === 404">🗺️</span>
        <span v-else>✈️</span>
      </div>
      <h1 class="text-6xl font-extrabold text-brand-600 mb-3">{{ error.statusCode }}</h1>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">
        {{ error.statusCode === 404 ? 'Pagina nu a fost găsită' : 'Ceva nu a funcționat' }}
      </h2>
      <p class="text-gray-500 mb-8 leading-relaxed">
        {{ error.statusCode === 404
          ? 'Pagina pe care o cauți nu există. Poate a fost mutată sau URL-ul este greșit.'
          : error.message || 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.' }}
      </p>
      <button @click="handleError"
        class="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg">
        ← Înapoi la căutare
      </button>
    </div>
  </div>
</template>
