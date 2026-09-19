import { PgClient } from '@effect/sql-pg'
import { type Challenge, type ChallengeId, DomainError } from '@kuma/domain'
import { Effect } from 'effect'
import { mapPostgresError } from '../../error'

export const fetch = (id: ChallengeId): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`
      select id, title, description, language,
             starter_files as "starterFiles",
             test_files as "testFiles",
             time_limit_minutes as "timeLimitMinutes"
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
