import { ChallengeId } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect, Schema } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'

const PathParams = Schema.Struct({
  id: ChallengeId,
})

export const del = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  return yield* challenges.del(id)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'challenges.delete' }),
    onSuccess: () => response(undefined, { status: 204 }),
  }),
)
