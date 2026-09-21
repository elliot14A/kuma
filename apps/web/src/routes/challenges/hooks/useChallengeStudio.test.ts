import { describe, expect, it } from 'bun:test'
import { ApiClient } from '#/lib'
import { useChallengeStudio } from './useChallengeStudio'

describe('useChallengeStudio Hook', () => {
  it('exposes hook definition and ApiClient integration', () => {
    expect(useChallengeStudio).toBeDefined()
    expect(typeof useChallengeStudio).toBe('function')
    expect(ApiClient).toBeDefined()
    expect(ApiClient.query).toBeDefined()
    expect(ApiClient.mutation).toBeDefined()
  })
})
