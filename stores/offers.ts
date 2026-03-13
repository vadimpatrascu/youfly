import { defineStore } from 'pinia'

export interface SimplifiedOffer {
  id: string
  total_amount: string
  total_currency: string
  tax_amount: string
  base_amount: string
  expires_at: string
  passengers: any[]
  slices: any[]
}

export const useOffersStore = defineStore('offers', {
  state: () => ({
    all: [] as SimplifiedOffer[],
    filtered: [] as SimplifiedOffer[],
    filters: {
      maxPrice: null as number | null,
      stops: [] as string[],
      airlines: [] as string[],
      maxDuration: null as number | null,
    },
    sortBy: 'price' as 'price' | 'duration' | 'departure',
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    uniqueAirlines: (state) => {
      const airlines = new Set<string>()
      state.all.forEach(offer => {
        offer.slices?.forEach((slice: any) => {
          slice.segments?.forEach((seg: any) => {
            if (seg.carrier_name) airlines.add(seg.carrier_name)
          })
        })
      })
      return Array.from(airlines).sort()
    },
    uniqueAirlinesWithCode: (state) => {
      const airlines = new Map<string, string>()
      state.all.forEach(offer => {
        offer.slices?.forEach((slice: any) => {
          slice.segments?.forEach((seg: any) => {
            if (seg.carrier_name && !airlines.has(seg.carrier_name)) {
              airlines.set(seg.carrier_name, seg.carrier_iata || '')
            }
          })
        })
      })
      return Array.from(airlines.entries()).map(([name, iata]) => ({ name, iata })).sort((a, b) => a.name.localeCompare(b.name))
    },
    priceRange: (state) => {
      if (!state.all.length) return { min: 0, max: 9999 }
      const prices = state.all.map(o => parseFloat(o.total_amount))
      return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
    },
  },
  actions: {
    setOffers(offers: SimplifiedOffer[]) {
      this.all = offers
      this.filtered = []
      this.error = null
      this.isLoading = false
      this.applyFilters()
    },
    async loadOffers(offerRequestId: string) {
      // Offers are now returned inline from /api/search
      // This is a fallback if navigating directly to /search without store data
      if (this.all.length > 0) {
        this.isLoading = false
        return
      }
      this.isLoading = true
      this.error = null
      this.all = []
      this.filtered = []
      try {
        const data = await $fetch<SimplifiedOffer[]>(`/api/offers?offer_request_id=${offerRequestId}`)
        this.all = data
        this.applyFilters()
      } catch (e: any) {
        this.error = e?.data?.message || 'Nu s-au putut încărca zborurile'
      } finally {
        this.isLoading = false
      }
    },
    applyFilters() {
      let results = [...this.all]
      if (this.filters.maxPrice !== null) {
        results = results.filter(o => parseFloat(o.total_amount) <= this.filters.maxPrice!)
      }
      if (this.filters.stops.length) {
        results = results.filter(o => {
          const maxStops = Math.max(...o.slices.map((s: any) => s.stops || 0))
          if (this.filters.stops.includes('direct') && maxStops === 0) return true
          if (this.filters.stops.includes('1stop') && maxStops === 1) return true
          if (this.filters.stops.includes('2plus') && maxStops >= 2) return true
          return false
        })
      }
      if (this.filters.airlines.length) {
        results = results.filter(o =>
          o.slices.some((s: any) =>
            s.segments?.some((seg: any) => this.filters.airlines.includes(seg.carrier_name))
          )
        )
      }
      if (this.filters.maxDuration !== null) {
        results = results.filter(o => {
          const totalMins = o.slices.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0)
          return totalMins <= this.filters.maxDuration! * 60
        })
      }
      // Sort
      if (this.sortBy === 'price') {
        results.sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
      } else if (this.sortBy === 'duration') {
        results.sort((a, b) => {
          const da = a.slices.reduce((s: number, sl: any) => s + (sl.duration_minutes || 0), 0)
          const db = b.slices.reduce((s: number, sl: any) => s + (sl.duration_minutes || 0), 0)
          return da - db
        })
      } else if (this.sortBy === 'departure') {
        results.sort((a, b) => {
          const da = a.slices[0]?.departing_at || ''
          const db = b.slices[0]?.departing_at || ''
          return da.localeCompare(db)
        })
      }
      this.filtered = results
    },
    clearFilters() {
      this.filters = { maxPrice: null, stops: [], airlines: [], maxDuration: null }
      this.sortBy = 'price'
      this.applyFilters()
    }
  }
})
