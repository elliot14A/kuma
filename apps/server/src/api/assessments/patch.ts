import { PatchAssessmentInput } from '@kuma/domain'
import * as assessments from '@postgres/assessments'
import { Effect } from 'effect'
import { HttpRouter, HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'
import { PathParams } from './delete'

export const patch = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  const payload = yield* HttpServerRequest.schemaBodyJson(PatchAssessmentInput)
  return yield* assessments.patch(id, payload)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'assessments.patch' }),
    onSuccess: (assessment) =>
      response(assessment, {
        message: 'assessment updated successfully',
      }),
  }),
)
