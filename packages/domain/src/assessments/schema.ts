import { Schema } from 'effect'
import { ChallengeId } from '../challenges/schema'
import { Base, FileMap } from '../common/schema'

export const AssessmentId = Schema.NonEmptyString.pipe(Schema.brand('AssessmentId'))
export type AssessmentId = typeof AssessmentId.Type

export enum AssessmentStatusEnum {
  Invited = 'invited',
  Active = 'active',
  Submitted = 'submitted',
  Expired = 'expired',
}
export const AssessmentStatus = Schema.Enum(AssessmentStatusEnum)
export type AssessmentStatus = typeof AssessmentStatus.Type

export const AssessmentMetadata = Schema.Struct({
  candidateFiles: Schema.Record(Schema.String, FileMap),
})
export type AssessmentMetadata = typeof AssessmentMetadata.Type

export const CreateAssessmentInput = Schema.Struct({
  challengeIds: Schema.Array(ChallengeId),
  candidateName: Schema.String,
  candidateEmail: Schema.optional(Schema.String),
  metadata: Schema.optional(AssessmentMetadata),
})
export type CreateAssessmentInput = typeof CreateAssessmentInput.Type

export const PatchAssessmentInput = Schema.Struct({
  candidateName: Schema.optional(Schema.String),
  candidateEmail: Schema.optional(Schema.NullOr(Schema.String)),
  status: Schema.optional(AssessmentStatus),
  startedAt: Schema.optional(Schema.NullOr(Schema.Date)),
  submittedAt: Schema.optional(Schema.NullOr(Schema.Date)),
  metadata: Schema.optional(AssessmentMetadata),
  challengeIds: Schema.optional(Schema.Array(ChallengeId)),
})
export type PatchAssessmentInput = typeof PatchAssessmentInput.Type

export const Assessment = Schema.Struct({
  ...Base.fields,
  id: AssessmentId,
  challengeIds: Schema.Array(ChallengeId),
  candidateName: Schema.String,
  candidateEmail: Schema.optional(Schema.String),
  status: AssessmentStatus,
  startedAt: Schema.optional(Schema.NullOr(Schema.Date)),
  submittedAt: Schema.optional(Schema.NullOr(Schema.Date)),
  metadata: AssessmentMetadata,
})
export type Assessment = typeof Assessment.Type
