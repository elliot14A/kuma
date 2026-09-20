import { PgClient } from '@effect/sql-pg'
import {
  type Assessment,
  type AssessmentId,
  DomainError,
  type PatchAssessmentInput,
  validateMetadata,
} from '@kuma/domain'
import { debug, info } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect } from 'effect'

export const patch = (
  id: AssessmentId,
  payload: PatchAssessmentInput,
): Effect.Effect<Assessment, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('patching assessment in database', { id })

    if (payload.metadata !== undefined) {
      yield* validateMetadata(payload.metadata)
    }

    const sql = yield* PgClient.PgClient

    return yield* sql
      .withTransaction(
        Effect.gen(function* () {
          const updateRows = yield* sql<{ readonly id: string }>`
            update assessments
            set candidate_name = coalesce(${payload.candidateName ?? null}, candidate_name),
                candidate_email = case when ${payload.candidateEmail !== undefined} then ${payload.candidateEmail} else candidate_email end,
                status = coalesce(${payload.status ?? null}, status),
                started_at = case when ${payload.startedAt !== undefined} then ${payload.startedAt} else started_at end,
                submitted_at = case when ${payload.submittedAt !== undefined} then ${payload.submittedAt} else submitted_at end,
                metadata = case when ${payload.metadata !== undefined} then ${sql.json(payload.metadata ?? {})} else metadata end
            where id = ${id}
            returning id
          `.pipe(
            Effect.mapError((cause) =>
              mapPostgresError(cause, 'update assessments', 'assessments.patch'),
            ),
          )

          if (updateRows.length === 0) {
            return yield* Effect.fail(
              DomainError.notFound({
                entity: 'Assessment',
                id,
                op: 'assessments.patch',
              }),
            )
          }

          if (payload.challengeIds !== undefined) {
            yield* sql`
              delete from assessment_challenges
              where assessment_id = ${id}
            `.pipe(
              Effect.mapError((cause) =>
                mapPostgresError(cause, 'delete from assessment_challenges', 'assessments.patch'),
              ),
            )

            if (payload.challengeIds.length > 0) {
              yield* sql`
                insert into assessment_challenges (
                  assessment_id, challenge_id, sort_order
                )
                select ${id}, cid, (ord - 1)::int
                from unnest(${payload.challengeIds}::uuid[]) with ordinality as t(cid, ord)
              `.pipe(
                Effect.mapError((cause) =>
                  mapPostgresError(cause, 'insert into assessment_challenges', 'assessments.patch'),
                ),
              )
            }
          }

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
              mapPostgresError(cause, 'select from assessments', 'assessments.patch'),
            ),
          )

          const assessment = rows[0]
          if (!assessment) {
            return yield* Effect.fail(
              DomainError.notFound({
                entity: 'Assessment',
                id,
                op: 'assessments.patch',
              }),
            )
          }

          yield* info('assessment updated successfully', { id: assessment.id })
          return assessment
        }),
      )
      .pipe(
        Effect.mapError((cause) =>
          cause instanceof DomainError
            ? cause
            : mapPostgresError(cause, 'transaction assessments.patch', 'assessments.patch'),
        ),
      )
  })
