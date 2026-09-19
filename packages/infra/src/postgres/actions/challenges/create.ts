import { PgClient } from '@effect/sql-pg'
import { type Challenge, DomainError } from '@kuma/domain'
import { Effect } from 'effect'
import { mapPostgresError } from '../../error'

export interface CreateChallengeInput {
  readonly title: string
  readonly description: string
  readonly language: Challenge['language']
  readonly starterFiles: Challenge['starterFiles']
  readonly testFiles: Challenge['testFiles']
  readonly timeLimitMinutes: number
}

export const create = (
  payload: CreateChallengeInput,
): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`
      insert into challenges (
        title, description, language, starter_files, test_files, time_limit_minutes
      ) values (
        ${payload.title}, ${payload.description},
        ${payload.language}, ${sql.json(payload.starterFiles)},
        ${sql.json(payload.testFiles)}, ${payload.timeLimitMinutes}
      )
      returning id, title, description, language,
                starter_files as "starterFiles",
                test_files as "testFiles",
                time_limit_minutes as "timeLimitMinutes"
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'insert into challenges', 'challenges.create'),
      ),
    )

    const challenge = rows[0]
    if (!challenge) {
      return yield* Effect.fail(
        DomainError.internal({
          message: 'Failed to insert challenge record',
          op: 'challenges.create',
        }),
      )
    }

    return challenge
  })
