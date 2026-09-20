import { Schema } from 'effect'
import { Base, FileMap, LanguageRuntime } from '../common/schema'

export const ChallengeId = Schema.NonEmptyString.pipe(Schema.brand('ChallengeId'))
export type ChallengeId = typeof ChallengeId.Type

export const ChallengeMetadata = Schema.Struct({
  starterFiles: FileMap,
  testFiles: FileMap,
})
export type ChallengeMetadata = typeof ChallengeMetadata.Type

export const CreateChallengeInput = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  language: LanguageRuntime,
  timeLimitMinutes: Schema.Number,
  metadata: ChallengeMetadata,
})
export type CreateChallengeInput = typeof CreateChallengeInput.Type

export const PatchChallengeInput = Schema.Struct({
  title: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  language: Schema.optional(LanguageRuntime),
  timeLimitMinutes: Schema.optional(Schema.Number),
  metadata: Schema.optional(ChallengeMetadata),
})
export type PatchChallengeInput = typeof PatchChallengeInput.Type

export const Challenge = Schema.Struct({
  ...Base.fields,
  id: ChallengeId,
  title: Schema.String,
  description: Schema.String,
  language: LanguageRuntime,
  timeLimitMinutes: Schema.Number,
  metadata: ChallengeMetadata,
})
export type Challenge = typeof Challenge.Type
