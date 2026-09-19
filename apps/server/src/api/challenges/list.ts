import { makePagination } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect } from 'effect'
import { HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

export const list = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const url = new URL(req.url, 'http://localhost')
  const queryParams: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value
  }

  const pagination = makePagination(queryParams)
  return yield* challenges.list(pagination).pipe(
    Effect.matchEffect({
      onFailure: (err) => response(err, { op: 'challenges.list' }),
      onSuccess: (result) => response(result),
    }),
  )
})
