import { PgClient } from '@effect/sql-pg'
import {
  type Assessment,
  type DomainError,
  getOffset,
  makePagination,
  makePaginationResult,
  type Pagination,
  type PaginationResult,
} from '@kuma/domain'
import { debug } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'
import type { CountRow } from '../common'

export const list = (
  paginationInput?: Pagination,
): Effect.Effect<PaginationResult<Assessment>, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    const p = paginationInput ?? makePagination()
    const offset = getOffset(p)

    yield* debug('listing assessments from database', {
      page: p.page,
      limit: p.limit,
      offset,
    })

    const sql = yield* PgClient.PgClient

    const countRows = yield* sql<CountRow>`
      select count(*)::int as count
      from assessments
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select count from assessments', 'assessments.list'),
      ),
    )

    const totalItems = Number(countRows[0]?.count ?? 0)
    if (totalItems === 0) {
      return makePaginationResult([], 0, p)
    }

    const items = yield* sql<Assessment>`
      select
        a.id,
        a.candidate_name as "candidateName",
        a.candidate_email as "candidateEmail",
        a.status,
        a.started_at as "startedAt",
        a.submitted_at as "submittedAt",
        a.metadata,
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        coalesce(
          array_agg(ac.challenge_id order by ac.sort_order)
            filter (where ac.challenge_id is not null),
          array[]::uuid[]
        ) as "challengeIds"
      from assessments a
      left join assessment_challenges ac
          on ac.assessment_id = a.id
      group by a.id
      order by a.created_at desc
      limit ${p.limit} offset ${offset}
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select from assessments', 'assessments.list'),
      ),
    )

    return makePaginationResult(items, totalItems, p)
  })
