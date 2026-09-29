import { describe, expect, it } from 'vitest'
import { siteTitle } from './index'

describe('siteTitle', () => {
  it('returns the tenant name alone when there is no page title', () => {
    expect(siteTitle({ name: 'Saddlebrook Counseling' })).toBe('Saddlebrook Counseling')
  })

  it('joins page title and tenant name', () => {
    expect(siteTitle({ name: 'Saddlebrook Counseling' }, 'Home')).toBe(
      'Home | Saddlebrook Counseling',
    )
  })
})
