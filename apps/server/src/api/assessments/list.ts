import { makePagination } from '@kuma/domain'
import * as assessments from '@postgres/assessments'
import { Effect, Option } from 'effect'
import { HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

export const list = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const queryParams = Option.match(HttpServerRequest.toURL(req), {
    onNone: () => ({}),
    onSome: (url) => HttpServerRequest.searchParamsFromURL(url),
  })

  const pagination = makePagination(queryParams)
  return yield* assessments.list(pagination)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'assessments.list' }),
    onSuccess: (result) =>
      response(result, {
        message: 'assessments listed successfully',
      }),
  }),
)
