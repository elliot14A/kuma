import { PgClient } from '@effect/sql-pg'
import { type Challenge, type ChallengeId, DomainError } from '@kuma/domain'
import { debug } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export const fetch = (id: ChallengeId): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('fetching challenge by id', { id })
    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`
      select id, title, description, language,
             time_limit_minutes as "timeLimitMinutes",
             metadata,
             created_at as "createdAt",
             updated_at as "updatedAt"
      from challenges
      where id = ${id}
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select from challenges', 'challenges.fetch'),
      ),
    )

    const challenge = rows[0]
    if (!challenge) {
      return yield* Effect.fail(
        DomainError.notFound({
          entity: 'Challenge',
          id,
          op: 'challenges.fetch',
        }),
      )
    }

    return challenge
  })
