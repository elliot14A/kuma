import type { ChallengeId } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'

export const del = Effect.gen(function* () {
  const params = yield* HttpRouter.params
  const id = params.id as ChallengeId
  return yield* challenges.del(id).pipe(
    Effect.matchEffect({
      onFailure: (err) => response(err, { op: 'challenges.delete' }),
      onSuccess: () => response(undefined, { status: 204 }),
    }),
  )
})
