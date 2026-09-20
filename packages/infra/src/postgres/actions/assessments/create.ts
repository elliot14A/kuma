import { PgClient } from '@effect/sql-pg'
import {
  Assessment,
  type AssessmentMetadata,
  type CreateAssessmentInput,
  DomainError,
  validateMetadata,
} from '@kuma/domain'
import { debug, info } from '@kuma/infra/logger'
import { mapPostgresError } from '@kuma/infra/postgres'
import { Effect, Schema, Struct } from 'effect'

export type { CreateAssessmentInput }

export const AssessmentRow = Schema.Struct(Struct.omit(Assessment.fields, ['challengeIds']))
export type AssessmentRow = typeof AssessmentRow.Type

export const create = (
  payload: CreateAssessmentInput,
): Effect.Effect<Assessment, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    yield* debug('inserting assessment into database', {
      candidateName: payload.candidateName,
      challengeCount: payload.challengeIds.length,
    })

    yield* validateMetadata(payload.metadata)

    const sql = yield* PgClient.PgClient

    return yield* sql
      .withTransaction(
        Effect.gen(function* () {
          const metadata: AssessmentMetadata = payload.metadata ?? { candidateFiles: {} }

          const rows = yield* sql<AssessmentRow>`
            insert into assessments (
              candidate_name, candidate_email, metadata
            ) values (
              ${payload.candidateName},
              ${payload.candidateEmail ?? null},
              ${sql.json(metadata)}
            )
            returning id,
                      candidate_name as "candidateName",
                      candidate_email as "candidateEmail",
                      status,
                      started_at as "startedAt",
                      submitted_at as "submittedAt",
                      metadata,
                      created_at as "createdAt",
                      updated_at as "updatedAt"
          `.pipe(
            Effect.mapError((cause) =>
              mapPostgresError(cause, 'insert into assessments', 'assessments.create'),
            ),
          )

          const assessmentRow = rows[0]
          if (!assessmentRow) {
            return yield* Effect.fail(
              DomainError.internal({
                message: 'failed to insert assessment record',
                op: 'assessments.create',
              }),
            )
          }

          if (payload.challengeIds.length > 0) {
            yield* sql`
              insert into assessment_challenges (
                assessment_id, challenge_id, sort_order
              )
              select ${assessmentRow.id}, cid, (ord - 1)::int
              from unnest(${payload.challengeIds}::uuid[]) with ordinality as t(cid, ord)
            `.pipe(
              Effect.mapError((cause) =>
                mapPostgresError(cause, 'insert into assessment_challenges', 'assessments.create'),
              ),
            )
          }

          const assessment: Assessment = {
            ...assessmentRow,
            challengeIds: payload.challengeIds,
          }

          yield* info('assessment created successfully', { id: assessment.id })
          return assessment
        }),
      )
      .pipe(
        Effect.mapError((cause) =>
          cause instanceof DomainError
            ? cause
            : mapPostgresError(cause, 'transaction assessments.create', 'assessments.create'),
        ),
      )
  })
