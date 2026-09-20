import { Schema } from 'effect'
import { AssessmentId } from '../assessments/schema'
import { ChallengeId } from '../challenges/schema'
import { FileMap } from '../common/schema'

export const ExecutionId = Schema.NonEmptyString.pipe(Schema.brand('ExecutionId'))
export type ExecutionId = typeof ExecutionId.Type

export enum ExecutionStatusEnum {
  Queued = 'queued',
  Running = 'running',
  Passed = 'passed',
  Failed = 'failed',
  Timeout = 'timeout',
  Error = 'error',
}
export const ExecutionStatus = Schema.Enum(ExecutionStatusEnum)
export type ExecutionStatus = typeof ExecutionStatus.Type

export const TestSummary = Schema.Struct({
  passed: Schema.Number,
  failed: Schema.Number,
  total: Schema.Number,
})
export type TestSummary = typeof TestSummary.Type

export const ExecutionRequest = Schema.Struct({
  assessmentId: AssessmentId,
  challengeId: ChallengeId,
  candidateFiles: FileMap,
  timeoutSeconds: Schema.optional(Schema.Number),
})
export type ExecutionRequest = typeof ExecutionRequest.Type

export const ExecutionResult = Schema.Struct({
  status: ExecutionStatus,
  exitCode: Schema.Number,
  stdout: Schema.String,
  stderr: Schema.String,
  durationMs: Schema.Number,
  summary: Schema.optional(TestSummary),
})
export type ExecutionResult = typeof ExecutionResult.Type
