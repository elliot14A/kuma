import { Schema } from 'effect'
import { FileMap, LanguageRuntime } from '../common/schema'

export const ChallengeId = Schema.String.pipe(Schema.brand('ChallengeId'))
export type ChallengeId = typeof ChallengeId.Type

export const Challenge = Schema.Struct({
  id: ChallengeId,
  title: Schema.String,
  description: Schema.String,
  language: LanguageRuntime,
  starterFiles: FileMap,
  testFiles: FileMap,
  timeLimitMinutes: Schema.Number,
})
export type Challenge = typeof Challenge.Type
