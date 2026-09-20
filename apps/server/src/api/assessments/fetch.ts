import * as assessments from '@postgres/assessments'
import { Effect } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'
import { PathParams } from './delete'

export const fetch = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  return yield* assessments.fetch(id)
}).pipe(
  Effect.matchEffect({
    onSuccess: (assessment) => response(assessment, { message: 'fetched assessment successfully' }),
    onFailure: (err) => response(err, { op: 'assessments.fetch' }),
  }),
)
