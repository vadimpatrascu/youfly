export interface RecentSearch {
  originCode: string
  originCity: string
  destinationCode: string
  destinationCity: string
  departureDate: string
  adults: number
  tripType: 'oneway' | 'return'
  searchedAt: string
}

const MAX_RECENT = 5

export function useRecentSearches() {
  const searches = ref<RecentSearch[]>([])

  function load() {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('youfly_recent_searches')
      if (raw) searches.value = JSON.parse(raw)
    } catch {}
  }

  function save(search: RecentSearch) {
    if (typeof window === 'undefined') return
    load()
    // Deduplicate by origin+destination+date
    const filtered = searches.value.filter(s =>
      !(s.originCode === search.originCode &&
        s.destinationCode === search.destinationCode &&
        s.departureDate === search.departureDate)
    )
    const updated = [search, ...filtered].slice(0, MAX_RECENT)
    searches.value = updated
    localStorage.setItem('youfly_recent_searches', JSON.stringify(updated))
  }

  function clear() {
    searches.value = []
    if (typeof window !== 'undefined') localStorage.removeItem('youfly_recent_searches')
  }

  onMounted(() => load())

  return { searches, save, clear, load }
}
