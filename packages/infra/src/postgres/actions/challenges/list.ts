import { PgClient } from '@effect/sql-pg'
import {
  type Challenge,
  type DomainError,
  getOffset,
  makePagination,
  makePaginationResult,
  type Pagination,
  type PaginationResult,
} from '@kuma/domain'
import { Effect } from 'effect'
import { mapPostgresError } from '../../error'

interface CountRow {
  readonly count: number
}

export const list = (
  paginationInput?: Pagination,
): Effect.Effect<PaginationResult<Challenge>, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    const p = paginationInput ?? makePagination()
    const offset = getOffset(p)
    const sql = yield* PgClient.PgClient

    const countRows = yield* sql<CountRow>`
      select count(*)::int as count
      from challenges
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select count from challenges', 'challenges.list'),
      ),
    )

    const totalItems = Number(countRows[0]?.count ?? 0)

    const items = yield* sql<Challenge>`
      select id, title, description, language,
             starter_files as "starterFiles",
             test_files as "testFiles",
             time_limit_minutes as "timeLimitMinutes"
      from challenges
      order by created_at desc
      limit ${p.limit} offset ${offset}
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select from challenges', 'challenges.list'),
      ),
    )

    return makePaginationResult(items, totalItems, p)
  })
