import { AssessmentId, ChallengeId, DomainError, FileMap } from '@kuma/domain'
import { SandboxRunner } from '@kuma/infra'
import * as assessments from '@postgres/assessments'
import * as challenges from '@postgres/challenges'
import { Effect, Schema } from 'effect'
import { HttpRouter, HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

export const PathParams = Schema.Struct({
  id: AssessmentId,
})

export const ExecuteBodySchema = Schema.Struct({
  challengeId: ChallengeId,
  candidateFiles: Schema.optional(FileMap),
  timeoutSeconds: Schema.optional(Schema.Number),
})

export const execute = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  const payload = yield* HttpServerRequest.schemaBodyJson(ExecuteBodySchema)

  const assessment = yield* assessments.fetch(id)

  const isAssigned = assessment.challengeIds.includes(payload.challengeId)
  if (!isAssigned) {
    return yield* Effect.fail(
      DomainError.conflict({
        message: `challenge '${payload.challengeId}' is not assigned to assessment '${id}'`,
        op: 'assessments.execute',
      }),
    )
  }

  const challenge = yield* challenges.fetch(payload.challengeId)

  const candidateFiles =
    payload.candidateFiles ?? assessment.metadata.candidateFiles[payload.challengeId] ?? {}
  const mergedFiles: FileMap = {
    ...challenge.metadata.starterFiles,
    ...candidateFiles,
    ...challenge.metadata.testFiles,
  }

  const runner = yield* SandboxRunner
  return yield* runner.execute({
    language: challenge.language,
    files: mergedFiles,
    timeoutSeconds:
      payload.timeoutSeconds ??
      (challenge.timeLimitMinutes > 0 ? challenge.timeLimitMinutes * 60 : undefined),
  })
}).pipe(
  Effect.matchEffect({
    onSuccess: (result) => response(result, { message: 'execution completed successfully' }),
    onFailure: (err) => response(err, { op: 'assessments.execute' }),
  }),
)
