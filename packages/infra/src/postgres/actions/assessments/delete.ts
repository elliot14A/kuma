import { PgClient } from '@effect/sql-pg'
import { type AssessmentId, DomainError } from '@kuma/domain'
import { debug, info } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export const del = (id: AssessmentId): Effect.Effect<void, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('deleting assessment by id', { id })

    const sql = yield* PgClient.PgClient
    const rows = yield* sql`
      delete from assessments where id = ${id} returning id
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'delete from assessments', 'assessments.delete'),
      ),
    )

    if (rows.length === 0) {
      return yield* Effect.fail(
        DomainError.notFound({
          entity: 'Assessment',
          id,
          op: 'assessments.delete',
        }),
      )
    }

    yield* info('assessment deleted successfully', { id })
  })

export { del as delete }
