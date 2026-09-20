import { AssessmentId } from '@kuma/domain'
import * as assessments from '@postgres/assessments'
import { Effect, Schema } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'

export const PathParams = Schema.Struct({
  id: AssessmentId,
})

export const del = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  return yield* assessments.del(id)
}).pipe(
  Effect.matchEffect({
    onSuccess: () => response(undefined, { status: 204 }),
    onFailure: (err) => response(err, { op: 'assessments.delete' }),
  }),
)
