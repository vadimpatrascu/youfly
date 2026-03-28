import { describe, it, expect } from 'vitest'
import { mapOffer, parseDurationMins } from '../server/utils/mapOffer'

describe('parseDurationMins', () => {
  it('parses hours and minutes', () => {
    expect(parseDurationMins('PT2H30M')).toBe(150)
    expect(parseDurationMins('PT1H')).toBe(60)
    expect(parseDurationMins('PT45M')).toBe(45)
    expect(parseDurationMins('PT0H0M')).toBe(0)
  })
  it('handles empty/null input', () => {
    expect(parseDurationMins('')).toBe(0)
    expect(parseDurationMins(null as any)).toBe(0)
    expect(parseDurationMins(undefined as any)).toBe(0)
  })
  it('handles malformed durations', () => {
    expect(parseDurationMins('not-a-duration')).toBe(0)
    expect(parseDurationMins('2h30m')).toBe(0) // wrong format
  })
})

describe('mapOffer', () => {
  it('returns empty skeleton for null/undefined input', () => {
    const result = mapOffer(null)
    expect(result.id).toBe('')
    expect(result.total_amount).toBe('0')
    expect(result.slices).toEqual([])
    expect(result.passengers).toEqual([])
  })

  it('returns empty skeleton for non-object input', () => {
    expect(mapOffer('string').id).toBe('')
    expect(mapOffer(123).id).toBe('')
    expect(mapOffer(true).id).toBe('')
  })

  it('maps a minimal valid offer', () => {
    const offer = {
      id: 'off_123',
      total_amount: '100.00',
      total_currency: 'EUR',
      tax_amount: '15.00',
      base_amount: '85.00',
      expires_at: '2026-04-01T00:00:00Z',
      passengers: [{ id: 'pas_1' }],
      slices: [],
    }
    const result = mapOffer(offer)
    expect(result.id).toBe('off_123')
    expect(result.total_amount).toBe('100.00')
    expect(result.total_currency).toBe('EUR')
    expect(result.tax_amount).toBe('15.00')
    expect(result.base_amount).toBe('85.00')
    expect(result.passengers).toHaveLength(1)
    expect(result.slices).toEqual([])
  })

  it('maps slices with segments', () => {
    const offer = {
      id: 'off_456',
      total_amount: '200.00',
      total_currency: 'GBP',
      slices: [{
        id: 'sli_1',
        origin: { iata_code: 'RMO', name: 'Chișinău', city: { name: 'Chișinău' } },
        destination: { iata_code: 'BCN', name: 'El Prat', city: { name: 'Barcelona' } },
        departing_at: '2026-04-15T10:00:00',
        arriving_at: '2026-04-15T13:45:00',
        duration: 'PT3H45M',
        segments: [{
          id: 'seg_1',
          departing_at: '2026-04-15T10:00:00',
          arriving_at: '2026-04-15T13:45:00',
          origin: { iata_code: 'RMO' },
          destination: { iata_code: 'BCN' },
          marketing_carrier: { name: 'Wizz Air', iata_code: 'W6' },
          marketing_carrier_flight_number: '3937',
          duration: 'PT3H45M',
        }],
      }],
    }
    const result = mapOffer(offer)
    expect(result.slices).toHaveLength(1)
    expect(result.slices[0].origin.iata_code).toBe('RMO')
    expect(result.slices[0].origin.city_name).toBe('Chișinău')
    expect(result.slices[0].destination.iata_code).toBe('BCN')
    expect(result.slices[0].duration_minutes).toBe(225)
    expect(result.slices[0].stops).toBe(0) // 1 segment = 0 stops
    expect(result.slices[0].segments[0].carrier_name).toBe('Wizz Air')
    expect(result.slices[0].segments[0].carrier_iata).toBe('W6')
    expect(result.slices[0].segments[0].flight_number).toBe('W63937')
  })

  it('calculates stops from segment count', () => {
    const offer = {
      id: 'off_789',
      total_amount: '300.00',
      total_currency: 'EUR',
      slices: [{
        id: 'sli_1',
        origin: { iata_code: 'RMO' },
        destination: { iata_code: 'LHR' },
        segments: [
          { id: 's1', origin: { iata_code: 'RMO' }, destination: { iata_code: 'IST' }, marketing_carrier: { iata_code: 'TK' } },
          { id: 's2', origin: { iata_code: 'IST' }, destination: { iata_code: 'LHR' }, marketing_carrier: { iata_code: 'TK' } },
        ],
      }],
    }
    const result = mapOffer(offer)
    expect(result.slices[0].stops).toBe(1)
  })

  it('handles missing optional fields gracefully', () => {
    const offer = {
      id: 'off_min',
      total_amount: '50.00',
      // no total_currency, no tax, no base, no passengers
      slices: [{
        id: 'sli_1',
        segments: [], // empty segments
      }],
    }
    const result = mapOffer(offer)
    expect(result.total_currency).toBe('EUR') // fallback
    expect(result.tax_amount).toBe('0')
    expect(result.base_amount).toBe('50.00')
    expect(result.passengers).toEqual([])
    expect(result.slices[0].stops).toBe(0)
    expect(result.slices[0].segments).toEqual([])
  })
})
