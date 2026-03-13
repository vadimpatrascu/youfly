import { useDebounceFn } from '@vueuse/core'
import type { Airport } from '~/stores/search'

const cache = new Map<string, Airport[]>()

export function useAirports() {
  const query = ref('')
  const suggestions = ref<Airport[]>([])
  const isLoading = ref(false)

  const doSearch = useDebounceFn(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      suggestions.value = []
      return
    }
    if (cache.has(trimmed)) {
      suggestions.value = cache.get(trimmed)!
      return
    }
    isLoading.value = true
    try {
      const results = await $fetch<Airport[]>(`/api/airports?q=${encodeURIComponent(trimmed)}`)
      cache.set(trimmed, results)
      suggestions.value = results
    } catch {
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }, 350)

  watch(query, doSearch)

  return { query, suggestions, isLoading }
}
