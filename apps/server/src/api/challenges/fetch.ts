import { ChallengeId } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect, Schema } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'

const PathParams = Schema.Struct({
  id: ChallengeId,
})

export const fetch = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  return yield* challenges.fetch(id)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'challenges.fetch' }),
    onSuccess: (challenge) =>
      response(challenge, {
        message: 'challenge fetched successfully',
      }),
  }),
)
