import { Effect, Schema } from 'effect'
import { DomainError } from '../error'

export const LanguageRuntime = Schema.Literals(['typescript', 'python'])
export type LanguageRuntime = typeof LanguageRuntime.Type

export const FileMap = Schema.Record(Schema.String, Schema.String)
export type FileMap = typeof FileMap.Type

export const MaxMetadataSizeBytes = 64 * 1024

export const Metadata = Schema.Record(Schema.String, Schema.Unknown)
export type Metadata = typeof Metadata.Type

export const validateMetadata = (metadata: unknown) =>
  Effect.gen(function* () {
    const raw = yield* Effect.try({
      try: () => JSON.stringify(metadata),
      catch: (cause) => DomainError.invalidInput({ cause, message: 'invalid metadata json' }),
    })
    const size = new TextEncoder().encode(raw).length
    if (size > MaxMetadataSizeBytes) {
      return yield* Effect.fail(
        DomainError.invalidInput({
          message: `metadata size (${size} bytes) exceeds limit of ${MaxMetadataSizeBytes} bytes`,
        }),
      )
    }
  })

export const Base = Schema.Struct({
  metadata: Metadata,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type Base = typeof Base.Type
