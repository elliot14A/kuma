import { Schema } from 'effect'
import { HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi'
import { AssessmentId } from '../assessments/schema'
import { ChallengeId } from '../challenges/schema'
import { FileMap } from '../common/schema'
import { DomainError } from '../error'
import { ExecutionResult } from './schema'

export const ExecutePayload = Schema.Struct({
  challengeId: ChallengeId,
  candidateFiles: Schema.optional(FileMap),
  timeoutSeconds: Schema.optional(Schema.Number),
})
export type ExecutePayload = typeof ExecutePayload.Type

export const ExecutionsGroup = HttpApiGroup.make('executions').add(
  HttpApiEndpoint.post('execute', '/assessments/:id/execute', {
    params: Schema.Struct({ id: AssessmentId }),
    payload: ExecutePayload,
    success: ExecutionResult,
    error: [DomainError],
  }),
)
