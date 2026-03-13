import { useDebounceFn } from '@vueuse/core'
import type { Airport } from '~/stores/search'

export function useAirports() {
  const query = ref('')
  const suggestions = ref<Airport[]>([])
  const isLoading = ref(false)
  const cache = new Map<string, Airport[]>()

  const search = useDebounceFn(async (q: string) => {
    if (q.length < 2) { suggestions.value = []; return }
    if (cache.has(q)) { suggestions.value = cache.get(q)!; return }
    isLoading.value = true
    try {
      const results = await $fetch<Airport[]>(`/api/airports?q=${encodeURIComponent(q)}`)
      cache.set(q, results)
      suggestions.value = results
    } finally {
      isLoading.value = false
    }
  }, 300)

  watch(query, search)
  return { query, suggestions, isLoading }
}
