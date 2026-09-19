import { PgClient } from '@effect/sql-pg'
import { type ChallengeId, DomainError } from '@kuma/domain'
import { Effect } from 'effect'
import { debug, info } from '../../../logger'
import { mapPostgresError } from '../../error'

export const del = (id: ChallengeId): Effect.Effect<void, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('deleting challenge by id', { id })
    const sql = yield* PgClient.PgClient
    const rows = yield* sql`
      delete from challenges where id = ${id} returning id
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'delete from challenges', 'challenges.delete'),
      ),
    )

    if (rows.length === 0) {
      return yield* Effect.fail(
        DomainError.notFound({
          entity: 'Challenge',
          id,
          op: 'challenges.delete',
        }),
      )
    }

    yield* info('challenge deleted successfully', { id })
  })

export { del as delete }
