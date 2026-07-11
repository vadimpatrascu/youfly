/**
 * Duffel Payments helpers.
 * Flow: create PaymentIntent → customer pays via Duffel component →
 * confirm PaymentIntent (tops up Balance) → create order paid from Balance.
 * Docs: https://duffel.com/docs/guides/collecting-customer-card-payments
 */
import { duffelFetch } from './duffel'

export interface DuffelPaymentIntent {
  id: string
  live_mode: boolean
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | string
  amount: string
  currency: string
  client_token: string
  confirmed_at: string | null
}

/** Duffel Payments processing fee rate (e.g. 0.029 = 2.9%). Override with NUXT_PAYMENTS_FEE_RATE. */
export function paymentsFeeRate(): number {
  const raw = useRuntimeConfig().paymentsFeeRate
  const n = parseFloat(String(raw))
  return Number.isFinite(n) && n >= 0 && n < 0.2 ? n : 0.029
}

/**
 * Amount to charge the customer so the Balance top-up covers the order:
 * gross = net / (1 - fee), rounded UP to the cent.
 */
export function grossChargeAmount(netTotal: string, feeRate?: number): string {
  const net = parseFloat(netTotal)
  const rate = feeRate ?? paymentsFeeRate()
  if (!Number.isFinite(net) || net <= 0) return '0.00'
  return (Math.ceil((net / (1 - rate)) * 100) / 100).toFixed(2)
}

export async function createPaymentIntent(amount: string, currency: string): Promise<DuffelPaymentIntent> {
  const res = await duffelFetch<{ data: DuffelPaymentIntent }>('/payments/payment_intents', {
    method: 'POST',
    body: { data: { amount, currency } },
  })
  return res.data
}

export async function getPaymentIntent(id: string): Promise<DuffelPaymentIntent> {
  const res = await duffelFetch<{ data: DuffelPaymentIntent }>(`/payments/payment_intents/${id}`)
  return res.data
}

/** Confirm a paid PaymentIntent — tops up the Duffel Balance.
 *  Single attempt (retries=0): confirming is not idempotent, and an ambiguous
 *  retry could mask whether the customer's money was actually collected. */
export async function confirmPaymentIntent(id: string): Promise<DuffelPaymentIntent> {
  const res = await duffelFetch<{ data: DuffelPaymentIntent }>(`/payments/payment_intents/${id}/actions/confirm`, {
    method: 'POST',
  }, 0)
  return res.data
}

/**
 * Best-effort refund of a confirmed PaymentIntent.
 * Returns true on success. On failure the caller MUST log loudly —
 * the payment then needs a manual refund in the Duffel dashboard.
 */
export async function tryRefundPaymentIntent(id: string): Promise<boolean> {
  try {
    await duffelFetch(`/payments/payment_intents/${id}/actions/refund`, { method: 'POST' })
    return true
  } catch {
    return false
  }
}
