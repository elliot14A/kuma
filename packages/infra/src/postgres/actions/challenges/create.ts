import { PgClient } from '@effect/sql-pg'
import { type Challenge, DomainError, validateMetadata } from '@kuma/domain'
import { debug, info } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export interface CreateChallengeInput {
  readonly title: string
  readonly description: string
  readonly language: Challenge['language']
  readonly timeLimitMinutes: number
  readonly metadata: Challenge['metadata']
}

export const create = (
  payload: CreateChallengeInput,
): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('inserting challenge into database', {
      title: payload.title,
      language: payload.language,
    })

    yield* validateMetadata(payload.metadata)

    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`
      insert into challenges (
        title, description, language, time_limit_minutes, metadata
      ) values (
        ${payload.title}, ${payload.description},
        ${payload.language}, ${payload.timeLimitMinutes},
        ${sql.json(payload.metadata)}
      )
      returning id, title, description, language,
                time_limit_minutes as "timeLimitMinutes",
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'insert into challenges', 'challenges.create'),
      ),
    )

    const challenge = rows[0]
    if (!challenge) {
      return yield* Effect.fail(
        DomainError.internal({
          message: 'failed to insert challenge record',
          op: 'challenges.create',
        }),
      )
    }

    yield* info('challenge created successfully', { id: challenge.id })
    return challenge
  })
