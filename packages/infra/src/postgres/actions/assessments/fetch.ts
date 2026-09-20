import { PgClient } from '@effect/sql-pg'
import { type Assessment, type AssessmentId, DomainError } from '@kuma/domain'
import { debug } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export const fetch = (
  id: AssessmentId,
): Effect.Effect<Assessment, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('fetching assessment by id', { id })

    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Assessment>`
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
      where a.id = ${id}
      group by a.id
    `.pipe(
      Effect.mapError((cause) =>
        mapPostgresError(cause, 'select from assessments', 'assessments.fetch'),
      ),
    )

    const assessment = rows[0]
    if (!assessment) {
      return yield* Effect.fail(
        DomainError.notFound({
          entity: 'Assessment',
          id,
          op: 'assessments.fetch',
        }),
      )
    }

    return assessment
  })
