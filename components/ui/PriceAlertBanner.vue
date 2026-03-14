<script setup lang="ts">
import { useSearchStore } from '~/stores/search'
const { t } = useI18n()
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
    success(t('priceAlert.successMsg', { from: searchStore.origin.city_name, to: searchStore.destination.city_name }))
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
    <span aria-hidden="true" class="text-xl">🔔</span>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-amber-900">{{ t('priceAlert.title') }}</p>
      <p v-if="!showAlert" class="text-xs text-amber-700">{{ t('priceAlert.subtitle') }}</p>
      <div v-if="showAlert" class="flex gap-2 mt-2">
        <input v-model="email" type="email" :placeholder="t('priceAlert.placeholder')"
          :aria-label="t('priceAlert.placeholder')"
          class="flex-1 min-w-0 px-3 py-1.5 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          @keyup.enter="subscribe" />
        <button @click="subscribe" :disabled="isSubmitting || !email"
          class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0">
          {{ isSubmitting ? t('priceAlert.activating') : t('priceAlert.activate') }}
        </button>
        <button @click="showAlert = false" :aria-label="t('common.close')" class="text-amber-500 text-lg shrink-0">×</button>
      </div>
    </div>
    <button v-if="!showAlert" @click="showAlert = true"
      class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">
      {{ t('priceAlert.activate') }}
    </button>
  </div>
</template>
