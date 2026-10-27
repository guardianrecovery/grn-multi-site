import { describe, expect, it } from 'vitest'
import { normalizeHost } from './index'

describe('normalizeHost', () => {
  it('lowercases and strips port', () => {
    expect(normalizeHost('Example.COM:4321')).toBe('example.com')
  })

  it('strips trailing dot and whitespace', () => {
    expect(normalizeHost(' example.com. ')).toBe('example.com')
  })
})
