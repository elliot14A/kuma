import type { Challenge, DomainError } from '@kuma/domain'
import { Effect } from 'effect'
import { mockKvStoreChallenge } from '#/mocks'

export const loadStudioChallenge = (): Effect.Effect<Challenge, DomainError> =>
  Effect.succeed(mockKvStoreChallenge)
