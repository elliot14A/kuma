import { describe, expect, it } from 'bun:test'
import { WebLayer, webRouter } from './index'

describe('Server Web Static Asset Layer', () => {
  it('exports webRouter and WebLayer successfully', () => {
    expect(webRouter).toBeDefined()
    expect(WebLayer).toBeDefined()
  })
})
