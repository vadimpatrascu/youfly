import { describe, it, expect } from 'vitest'
import { grossChargeAmount } from '../server/utils/payments'

describe('grossChargeAmount', () => {
  it('grosses up by the fee rate, rounding up to the cent', () => {
    // 120 / (1 - 0.029) = 123.5839... → 123.59
    expect(grossChargeAmount('120.00', 0.029)).toBe('123.59')
  })

  it('covers small amounts', () => {
    // 1 / 0.971 = 1.0298... → 1.03
    expect(grossChargeAmount('1.00', 0.029)).toBe('1.03')
  })

  it('is identity at zero fee', () => {
    expect(grossChargeAmount('100.00', 0)).toBe('100.00')
  })

  it('returns 0.00 for invalid or non-positive input', () => {
    expect(grossChargeAmount('0', 0.029)).toBe('0.00')
    expect(grossChargeAmount('-5', 0.029)).toBe('0.00')
    expect(grossChargeAmount('abc', 0.029)).toBe('0.00')
  })

  it('always covers the net amount after the fee is deducted', () => {
    for (const net of ['35.00', '73.20', '999.99', '31.07']) {
      const gross = parseFloat(grossChargeAmount(net, 0.029))
      const topUp = gross * (1 - 0.029)
      expect(topUp + 0.011).toBeGreaterThanOrEqual(parseFloat(net))
    }
  })
})
