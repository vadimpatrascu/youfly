<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const searchStore = useSearchStore()
const { success } = useToast()

const showAlert = ref(false)
const email = ref('')
const isSubmitting = ref(false)
const subscribed = ref(false)

async function subscribe() {
  if (!email.value || !searchStore.origin || !searchStore.destination) return
  isSubmitting.value = true
  try {
    await $fetch('/api/newsletter', {
      method: 'POST',
      body: {
        email: email.value,
        route: `${searchStore.origin.airport_iata || searchStore.origin.iata_code}-${searchStore.destination.airport_iata || searchStore.destination.iata_code}`,
      }
    })
    subscribed.value = true
    success(`Alertă de prețuri activată pentru ${searchStore.origin.city_name} → ${searchStore.destination.city_name}!`)
    showAlert.value = false
  } catch {
    // fail silently
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="!subscribed" class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
    <span class="text-xl">🔔</span>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-amber-900">Primești alertă când prețul scade</p>
      <p v-if="!showAlert" class="text-xs text-amber-700">Activează alertele de prețuri gratuit</p>
      <div v-if="showAlert" class="flex gap-2 mt-2">
        <input v-model="email" type="email" placeholder="Email tău..."
          class="flex-1 min-w-0 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          @keyup.enter="subscribe" />
        <button @click="subscribe" :disabled="isSubmitting || !email"
          class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0">
          {{ isSubmitting ? '...' : 'Activează' }}
        </button>
        <button @click="showAlert = false" class="text-amber-500 text-lg shrink-0">×</button>
      </div>
    </div>
    <button v-if="!showAlert" @click="showAlert = true"
      class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
      Activează
    </button>
  </div>
</template>
