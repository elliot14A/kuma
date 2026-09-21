import { describe, expect, it } from 'bun:test'
import { ApiLayer } from './routes'

describe('Server API Routes Layer', () => {
  it('creates ApiLayer successfully', () => {
    expect(ApiLayer).toBeDefined()
  })
})
