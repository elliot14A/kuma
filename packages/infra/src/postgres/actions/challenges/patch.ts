import { PgClient } from '@effect/sql-pg'
import {
  type Challenge,
  type ChallengeId,
  DomainError,
  type PatchChallengeInput,
  validateMetadata,
} from '@kuma/domain'
import { debug, info } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export const patch = (
  id: ChallengeId,
  payload: PatchChallengeInput,
): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('patching challenge in database', { id })

    if (payload.metadata !== undefined) {
      yield* validateMetadata(payload.metadata)
    }

    const sql = yield* PgClient.PgClient

    const rows = yield* sql<Challenge>`
      update challenges
      set title = coalesce(${payload.title ?? null}, title),
          description = coalesce(${payload.description ?? null}, description),
          language = coalesce(${payload.language ?? null}, language),
          time_limit_minutes = coalesce(${payload.timeLimitMinutes ?? null}, time_limit_minutes),
          metadata = case when ${payload.metadata !== undefined} then ${sql.json(payload.metadata ?? {})} else metadata end
      where id = ${id}
      returning id, title, description, language,
                time_limit_minutes as "timeLimitMinutes",
                metadata,
                created_at as "createdAt",
                updated_at as "updatedAt"
    `.pipe(
      Effect.mapError((cause) => mapPostgresError(cause, 'update challenges', 'challenges.patch')),
    )

    const challenge = rows[0]
    if (!challenge) {
      return yield* Effect.fail(
        DomainError.notFound({
          entity: 'Challenge',
          id,
          op: 'challenges.patch',
        }),
      )
    }

    yield* info('challenge updated successfully', { id: challenge.id })
    return challenge
  })
