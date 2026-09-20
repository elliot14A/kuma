import { CreateAssessmentInput } from '@kuma/domain'
import * as assessments from '@postgres/assessments'
import { Effect } from 'effect'
import { HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

export const create = Effect.gen(function* () {
  const payload = yield* HttpServerRequest.schemaBodyJson(CreateAssessmentInput)
  return yield* assessments.create(payload)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'assessments.create' }),
    onSuccess: (assessment) =>
      response(assessment, {
        status: 201,
        message: 'assessment created successfully',
      }),
  }),
)
