import { PatchChallengeInput } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect } from 'effect'
import { HttpRouter, HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'
import { PathParams } from './delete'

export const patch = Effect.gen(function* () {
  const { id } = yield* HttpRouter.schemaPathParams(PathParams)
  const payload = yield* HttpServerRequest.schemaBodyJson(PatchChallengeInput)
  return yield* challenges.patch(id, payload)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'challenges.patch' }),
    onSuccess: (challenge) =>
      response(challenge, {
        message: 'challenge updated successfully',
      }),
  }),
)
