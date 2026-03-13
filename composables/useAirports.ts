import { useDebounceFn } from '@vueuse/core'
import type { Airport } from '~/stores/search'

const cache = new Map<string, Airport[]>()

// Popular airports to show when input is empty or has < 2 chars
const POPULAR_AIRPORTS: Airport[] = [
  { iata_code: 'MD', airport_iata: 'RMO', name: 'Chișinău International Airport', city_name: 'Chișinău', country_code: 'MD' },
  { iata_code: 'RO', airport_iata: 'OTP', name: 'Henri Coandă International Airport', city_name: 'București', country_code: 'RO' },
  { iata_code: 'TR', airport_iata: 'IST', name: 'Istanbul Airport', city_name: 'Istanbul', country_code: 'TR' },
  { iata_code: 'GB', airport_iata: 'LHR', name: 'Heathrow Airport', city_name: 'Londra', country_code: 'GB' },
  { iata_code: 'DE', airport_iata: 'FRA', name: 'Frankfurt Airport', city_name: 'Frankfurt', country_code: 'DE' },
  { iata_code: 'FR', airport_iata: 'CDG', name: 'Charles de Gaulle Airport', city_name: 'Paris', country_code: 'FR' },
  { iata_code: 'IT', airport_iata: 'FCO', name: 'Leonardo da Vinci Airport', city_name: 'Roma', country_code: 'IT' },
  { iata_code: 'ES', airport_iata: 'BCN', name: 'El Prat Airport', city_name: 'Barcelona', country_code: 'ES' },
]

export function useAirports() {
  const query = ref('')
  const suggestions = ref<Airport[]>([])
  const isLoading = ref(false)

  const doSearch = useDebounceFn(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      suggestions.value = trimmed.length === 0 ? POPULAR_AIRPORTS : []
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

  return { query, suggestions, isLoading, popularAirports: POPULAR_AIRPORTS }
}
