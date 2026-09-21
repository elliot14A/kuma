import type { ChallengeId, DomainError, ExecutionResult, FileMap } from '@kuma/domain'
import { Effect } from 'effect'
import { mockExecutionResult } from '#/mocks'

export const verifyChallengeSolution = (
  _challengeId: ChallengeId,
  _files: FileMap,
): Effect.Effect<ExecutionResult, DomainError> => Effect.succeed(mockExecutionResult)
