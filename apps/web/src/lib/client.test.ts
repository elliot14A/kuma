import { describe, expect, it } from 'bun:test'
import type { ChallengeId } from '@kuma/domain'
import { ApiClient } from './client'

describe('Web ApiClient (AtomHttpApi)', () => {
  it('creates query and mutation atoms for all domain groups', () => {
    expect(ApiClient.query).toBeDefined()
    expect(ApiClient.mutation).toBeDefined()

    const listChallengesQuery = ApiClient.query('challenges', 'list', {
      query: {},
    })
    expect(listChallengesQuery).toBeDefined()

    const fetchChallengeQuery = ApiClient.query('challenges', 'fetch', {
      params: { id: 'ch_123' as ChallengeId },
    })
    expect(fetchChallengeQuery).toBeDefined()

    const createChallengeMutation = ApiClient.mutation('challenges', 'create')
    expect(createChallengeMutation).toBeDefined()

    const executeMutation = ApiClient.mutation('executions', 'execute')
    expect(executeMutation).toBeDefined()
  })
})
