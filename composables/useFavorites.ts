const STORAGE_KEY = 'youfly_favorites'

interface FavoriteRoute {
  from: string
  fromCity: string
  to: string
  toCity: string
  savedAt: string
}

function loadFavorites(): FavoriteRoute[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const favorites = ref<FavoriteRoute[]>([])

if (typeof window !== 'undefined') {
  favorites.value = loadFavorites()
}

export function useFavorites() {
  function toggle(route: Omit<FavoriteRoute, 'savedAt'>) {
    const idx = favorites.value.findIndex(f => f.from === route.from && f.to === route.to)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.unshift({ ...route, savedAt: new Date().toISOString() })
      if (favorites.value.length > 10) favorites.value = favorites.value.slice(0, 10)
    }
    save()
  }

  function isFavorite(from: string, to: string) {
    return favorites.value.some(f => f.from === from && f.to === to)
  }

  function save() {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value)) } catch {}
    }
  }

  return { favorites, toggle, isFavorite }
}
