import { useDebounceFn } from '@vueuse/core'
import type { Airport } from '~/stores/search'

const cache = new Map<string, Airport[]>()

// Popular airports base data (city names translated at use time)
const POPULAR_AIRPORTS_BASE = [
  { iata_code: 'MD', airport_iata: 'RMO', nameKey: 'airports.chisinauAirportName', country_code: 'MD', cityKey: 'airports.city_RMO' },
  { iata_code: 'RO', airport_iata: 'OTP', nameKey: null, name: 'Henri Coandă International Airport', country_code: 'RO', cityKey: 'airports.city_OTP' },
  { iata_code: 'TR', airport_iata: 'IST', nameKey: null, name: 'Istanbul Airport', country_code: 'TR', cityKey: 'airports.city_IST' },
  { iata_code: 'GB', airport_iata: 'LTN', nameKey: null, name: 'Luton Airport', country_code: 'GB', cityKey: 'airports.city_LTN' },
  { iata_code: 'AT', airport_iata: 'VIE', nameKey: null, name: 'Vienna International Airport', country_code: 'AT', cityKey: 'airports.city_VIE' },
  { iata_code: 'FR', airport_iata: 'CDG', nameKey: null, name: 'Charles de Gaulle Airport', country_code: 'FR', cityKey: 'airports.city_CDG' },
  { iata_code: 'IT', airport_iata: 'MXP', nameKey: null, name: 'Malpensa Airport', country_code: 'IT', cityKey: 'airports.city_MXP' },
  { iata_code: 'ES', airport_iata: 'BCN', nameKey: null, name: 'El Prat Airport', country_code: 'ES', cityKey: 'airports.city_BCN' },
  { iata_code: 'IL', airport_iata: 'TLV', nameKey: null, name: 'Ben Gurion Airport', country_code: 'IL', cityKey: 'airports.city_TLV' },
  { iata_code: 'AE', airport_iata: 'DXB', nameKey: null, name: 'Dubai International Airport', country_code: 'AE', cityKey: 'airports.city_DXB' },
  { iata_code: 'DE', airport_iata: 'FRA', nameKey: null, name: 'Frankfurt Main Airport', country_code: 'DE', cityKey: 'airports.city_FRA' },
  { iata_code: 'PL', airport_iata: 'WAW', nameKey: null, name: 'Chopin Airport', country_code: 'PL', cityKey: 'airports.city_WAW' },
]

export function useAirports() {
  const query = ref('')
  const suggestions = ref<Airport[]>([])
  const isLoading = ref(false)
  const { t } = useI18n()

  const popularAirports = computed<Airport[]>(() =>
    POPULAR_AIRPORTS_BASE.map(a => ({ ...a, name: a.nameKey ? t(a.nameKey) : (a.name ?? ''), city_name: t(a.cityKey) }))
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
