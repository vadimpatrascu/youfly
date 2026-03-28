import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidIata,
  isValidDate,
  isValidDuffelId,
  isValidBookingRef,
  isValidPhone,
  clampInt,
  safeString,
} from '../server/utils/validators'

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('user+tag@domain.org')).toBe(true)
  })
  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a@b.c')).toBe(false) // TLD too short
    expect(isValidEmail('a@.com')).toBe(false)
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(undefined)).toBe(false)
    expect(isValidEmail(123)).toBe(false)
  })
})

describe('isValidIata', () => {
  it('accepts valid IATA codes', () => {
    expect(isValidIata('RMO')).toBe(true)
    expect(isValidIata('jfk')).toBe(true) // case-insensitive
    expect(isValidIata('LH1')).toBe(true) // alphanumeric
  })
  it('rejects invalid IATA codes', () => {
    expect(isValidIata('')).toBe(false)
    expect(isValidIata('AB')).toBe(false) // too short
    expect(isValidIata('ABCD')).toBe(false) // too long
    expect(isValidIata('A-B')).toBe(false)
    expect(isValidIata(null)).toBe(false)
    expect(isValidIata(123)).toBe(false)
  })
})

describe('isValidDate', () => {
  it('accepts valid dates', () => {
    expect(isValidDate('2026-03-28')).toBe(true)
    expect(isValidDate('2025-01-01')).toBe(true)
    expect(isValidDate('2030-12-31')).toBe(true)
  })
  it('rejects invalid dates', () => {
    expect(isValidDate('')).toBe(false)
    expect(isValidDate('2026-13-01')).toBe(false) // invalid month
    expect(isValidDate('2026-02-30')).toBe(false) // Feb 30
    expect(isValidDate('28-03-2026')).toBe(false) // wrong format
    expect(isValidDate('not-a-date')).toBe(false)
    expect(isValidDate(null)).toBe(false)
    expect(isValidDate(undefined)).toBe(false)
  })
})

describe('isValidDuffelId', () => {
  it('accepts valid Duffel IDs', () => {
    expect(isValidDuffelId('off_123abc')).toBe(true)
    expect(isValidDuffelId('orq_abc-def_123')).toBe(true)
    expect(isValidDuffelId('a')).toBe(true)
  })
  it('rejects invalid Duffel IDs', () => {
    expect(isValidDuffelId('')).toBe(false)
    expect(isValidDuffelId(null)).toBe(false)
    expect(isValidDuffelId('a'.repeat(101))).toBe(false) // too long
    expect(isValidDuffelId('id with spaces')).toBe(false)
    expect(isValidDuffelId('id/path')).toBe(false)
    expect(isValidDuffelId('<script>')).toBe(false)
  })
})

describe('isValidBookingRef', () => {
  it('accepts valid booking references', () => {
    expect(isValidBookingRef('AB12CD')).toBe(true)
    expect(isValidBookingRef('ABCD')).toBe(true) // 4 chars
    expect(isValidBookingRef('ABCDEFGHIJ')).toBe(true) // 10 chars
    expect(isValidBookingRef('yf123')).toBe(true) // lowercase input
  })
  it('rejects invalid booking references', () => {
    expect(isValidBookingRef('')).toBe(false)
    expect(isValidBookingRef('ABC')).toBe(false) // too short
    expect(isValidBookingRef('ABCDEFGHIJK')).toBe(false) // too long
    expect(isValidBookingRef('AB-CD')).toBe(false)
    expect(isValidBookingRef(null)).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('accepts valid phone numbers', () => {
    expect(isValidPhone('+37360123456')).toBe(true)
    expect(isValidPhone('060123456')).toBe(true)
    expect(isValidPhone('+44 20 7946 0958')).toBe(true) // with spaces
  })
  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('')).toBe(false)
    expect(isValidPhone('123')).toBe(false) // too short
    expect(isValidPhone('1234567890123456')).toBe(false) // too long (16 digits)
    expect(isValidPhone(null)).toBe(false)
    expect(isValidPhone(undefined)).toBe(false)
  })
})

describe('clampInt', () => {
  it('clamps values to range', () => {
    expect(clampInt(5, 1, 9, 1)).toBe(5)
    expect(clampInt(0, 1, 9, 1)).toBe(1)
    expect(clampInt(100, 1, 9, 1)).toBe(9)
    expect(clampInt(-5, 0, 4, 0)).toBe(0)
  })
  it('uses fallback for invalid input', () => {
    expect(clampInt(null, 1, 9, 3)).toBe(3)
    expect(clampInt(undefined, 1, 9, 3)).toBe(3)
    expect(clampInt('abc', 1, 9, 3)).toBe(3)
    expect(clampInt(NaN, 1, 9, 3)).toBe(3)
  })
  it('floors floating point numbers', () => {
    expect(clampInt(2.9, 1, 9, 1)).toBe(2)
    expect(clampInt(1.1, 1, 9, 1)).toBe(1)
  })
})

describe('safeString', () => {
  it('trims and truncates strings', () => {
    expect(safeString('  hello  ', 100)).toBe('hello')
    expect(safeString('hello world', 5)).toBe('hello')
    expect(safeString('', 100)).toBe('')
  })
  it('returns empty for non-strings', () => {
    expect(safeString(null, 100)).toBe('')
    expect(safeString(undefined, 100)).toBe('')
    expect(safeString(123, 100)).toBe('')
    expect(safeString({}, 100)).toBe('')
  })
})
