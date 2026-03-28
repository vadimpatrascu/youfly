import { describe, it, expect } from 'vitest'
import { escapeHtml, sanitizeInput } from '../server/utils/sanitize'

describe('escapeHtml', () => {
  it('escapes dangerous HTML characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(escapeHtml("it's a test")).toBe("it&#x27;s a test")
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })
  it('preserves safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
    expect(escapeHtml('Price: 100 EUR')).toBe('Price: 100 EUR')
    expect(escapeHtml('')).toBe('')
  })
})

describe('sanitizeInput', () => {
  it('trims and limits length', () => {
    expect(sanitizeInput('  hello  ', 10)).toBe('hello')
    expect(sanitizeInput('hello world', 5)).toBe('hello')
  })
  it('escapes HTML in output', () => {
    expect(sanitizeInput('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;')
  })
  it('returns empty string for non-string inputs', () => {
    expect(sanitizeInput(null)).toBe('')
    expect(sanitizeInput(undefined)).toBe('')
    expect(sanitizeInput(123)).toBe('')
    expect(sanitizeInput({})).toBe('')
  })
  it('defaults to 500 char limit', () => {
    const long = 'a'.repeat(600)
    expect(sanitizeInput(long).length).toBe(500)
  })
})
