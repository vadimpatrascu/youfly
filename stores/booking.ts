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

export interface SelectedSeat {
  serviceId: string
  passengerId: string
  segmentId: string
  designator: string
  amount: string
  currency: string
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedOffer: null as SimplifiedOffer | null,
    passengers: [] as PassengerFormData[],
    selectedSeats: [] as SelectedSeat[],
    isBooking: false,
    bookingError: null as string | null,
    confirmedBooking: null as any,
    paymentComplete: false,
  }),
  getters: {
    seatServiceIds: (state): string[] => state.selectedSeats.map((s) => s.serviceId),
    seatTotal: (state): number => state.selectedSeats.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0),
  },
  actions: {
    selectOffer(offer: SimplifiedOffer) {
      this.selectedOffer = offer
      this.passengers = []
      this.selectedSeats = []
      this.bookingError = null
      this.confirmedBooking = null
    },
    setPassengers(passengers: PassengerFormData[]) {
      this.passengers = passengers
    },
    setSelectedSeats(seats: SelectedSeat[]) {
      this.selectedSeats = seats
    },
    async submitBooking(paymentIntentId: string) {
      if (!this.selectedOffer || !this.passengers.length) return false
      // Prevent double-submission
      if (this.isBooking) return false
      this.isBooking = true
      this.bookingError = null
      try {
        const result = await $fetch<any>('/api/book', {
          method: 'POST',
          body: {
            offerId: this.selectedOffer.id,
            passengers: this.passengers,
            paymentIntentId,
            serviceIds: this.seatServiceIds,
          }
        })
        this.confirmedBooking = result
        // Persist confirmed booking to survive page refresh
        try {
          sessionStorage.setItem('youfly_confirmed_booking', JSON.stringify(result))
          if (this.selectedOffer) {
            sessionStorage.setItem('youfly_confirmed_offer', JSON.stringify(this.selectedOffer))
          }
          sessionStorage.setItem('youfly_confirmed_passengers', JSON.stringify(this.passengers))
        } catch {}
        return true
      } catch (e: any) {
        const msg = e?.data?.message || ''
        const { $i18n } = useNuxtApp()
        const t = ($i18n as any).t
        if (msg === 'offer_expired') {
          this.bookingError = t('payment.offerExpired')
        } else if (msg === 'booking_failed_refund') {
          this.bookingError = t('payment.refundNotice')
        } else if (msg === 'payment_required' || msg === 'payment_failed' || msg === 'payment_mismatch' || msg === 'payment_already_used') {
          this.bookingError = t('payment.paymentFailed')
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
      this.selectedSeats = []
      this.isBooking = false
      this.bookingError = null
      this.confirmedBooking = null
      this.paymentComplete = false
    }
  }
})
