import { useDebounceFn } from '@vueuse/core'
import type { Airport } from '~/stores/search'

const cache = new Map<string, Airport[]>()

// Popular airports base data (city names translated at use time)
const POPULAR_AIRPORTS_BASE = [
  { iata_code: 'MD', airport_iata: 'RMO', nameKey: 'airports.chisinauAirportName', country_code: 'MD', cityKey: 'airports.city_RMO' },
  { iata_code: 'RO', airport_iata: 'OTP', nameKey: null, name: 'Henri Coandă International Airport', country_code: 'RO', cityKey: 'airports.city_OTP' },
  { iata_code: 'TR', airport_iata: 'IST', nameKey: null, name: 'Istanbul Airport', country_code: 'TR', cityKey: 'airports.city_IST' },
  { iata_code: 'GB', airport_iata: 'LHR', nameKey: null, name: 'Heathrow Airport', country_code: 'GB', cityKey: 'airports.city_LHR' },
  { iata_code: 'DE', airport_iata: 'FRA', nameKey: null, name: 'Frankfurt Airport', country_code: 'DE', cityKey: 'airports.city_FRA' },
  { iata_code: 'FR', airport_iata: 'CDG', nameKey: null, name: 'Charles de Gaulle Airport', country_code: 'FR', cityKey: 'airports.city_CDG' },
  { iata_code: 'IT', airport_iata: 'FCO', nameKey: null, name: 'Leonardo da Vinci Airport', country_code: 'IT', cityKey: 'airports.city_FCO' },
  { iata_code: 'ES', airport_iata: 'BCN', nameKey: null, name: 'El Prat Airport', country_code: 'ES', cityKey: 'airports.city_BCN' },
]

export function useAirports() {
  const query = ref('')
  const suggestions = ref<Airport[]>([])
  const isLoading = ref(false)
  const { t } = useI18n()

  const popularAirports = computed<Airport[]>(() =>
    POPULAR_AIRPORTS_BASE.map(a => ({ ...a, name: a.nameKey ? t(a.nameKey) : a.name, city_name: t(a.cityKey) }))
  )

  const doSearch = useDebounceFn(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      suggestions.value = trimmed.length === 0 ? popularAirports.value : []
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

  return { query, suggestions, isLoading, popularAirports }
}
