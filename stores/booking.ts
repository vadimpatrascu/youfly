import { defineStore } from 'pinia'
import type { SimplifiedOffer } from './offers'

export interface PassengerFormData {
  duffelPassengerId: string
  type: 'adult' | 'child' | 'infant_without_seat'
  title: string
  given_name: string
  family_name: string
  born_on: string
  email?: string
  phone?: string
  gender: string
  passport_number?: string
  passport_country?: string
  passport_expires?: string
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedOffer: null as SimplifiedOffer | null,
    passengers: [] as PassengerFormData[],
    isBooking: false,
    bookingError: null as string | null,
    confirmedBooking: null as any,
    paymentComplete: false,
  }),
  actions: {
    selectOffer(offer: SimplifiedOffer) {
      this.selectedOffer = offer
      this.passengers = []
      this.bookingError = null
      this.confirmedBooking = null
    },
    setPassengers(passengers: PassengerFormData[]) {
      this.passengers = passengers
    },
    async submitBooking() {
      if (!this.selectedOffer || !this.passengers.length) return false
      this.isBooking = true
      this.bookingError = null
      try {
        const result = await $fetch<any>('/api/book', {
          method: 'POST',
          body: {
            offerId: this.selectedOffer.id,
            passengers: this.passengers,
            totalAmount: this.selectedOffer.total_amount,
            currency: this.selectedOffer.total_currency,
          }
        })
        this.confirmedBooking = result
        return true
      } catch (e: any) {
        const msg = e?.data?.message || ''
        const { $i18n } = useNuxtApp()
        const t = ($i18n as any).t
        if (msg === 'offer_expired') {
          this.bookingError = t('payment.offerExpired')
        } else {
          this.bookingError = msg || t('payment.bookingFailed')
        }
        return false
      } finally {
        this.isBooking = false
      }
    },
    reset() {
      this.selectedOffer = null
      this.passengers = []
      this.isBooking = false
      this.bookingError = null
      this.confirmedBooking = null
      this.paymentComplete = false
    }
  }
})
