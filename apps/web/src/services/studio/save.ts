import type { Challenge, DomainError } from '@kuma/domain'
import { Effect } from 'effect'

export const saveChallengeDraft = (_challenge: Challenge): Effect.Effect<void, DomainError> =>
  Effect.void
