import { defineStore } from 'pinia'

export interface Airport {
  iata_code: string
  airport_iata: string
  name: string
  city_name: string
  country_code: string
}

export const useSearchStore = defineStore('search', {
  state: () => ({
    origin: null as Airport | null,
    destination: null as Airport | null,
    departureDate: '' as string,
    returnDate: '' as string,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy' as string,
    offerRequestId: null as string | null,
    isSearching: false,
    searchError: null as string | null,
    tripType: 'oneway' as 'oneway' | 'return',
  }),
  actions: {
    async submitSearch() {
      if (!this.origin || !this.destination || !this.departureDate) return false
      this.isSearching = true
      this.searchError = null
      try {
        const res = await $fetch<{ offerRequestId: string; offers: any[] }>('/api/search', {
          method: 'POST',
          body: {
            origin: this.origin.airport_iata || this.origin.iata_code,
            destination: this.destination.airport_iata || this.destination.iata_code,
            departureDate: this.departureDate,
            returnDate: this.tripType === 'return' ? this.returnDate : undefined,
            adults: this.adults,
            children: this.children,
            infants: this.infants,
            cabinClass: this.cabinClass,
          }
        })
        this.offerRequestId = res.offerRequestId
        // Store offers directly in offers store (no second fetch needed)
        const { useOffersStore } = await import('./offers')
        const offersStore = useOffersStore()
        offersStore.setOffers(res.offers || [])
        return true
      } catch (e: any) {
        this.searchError = e?.data?.message || 'Căutarea a eșuat. Vă rugăm încercați din nou.'
        return false
      } finally {
        this.isSearching = false
      }
    }
  }
})
