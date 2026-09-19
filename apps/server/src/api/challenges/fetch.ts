import type { ChallengeId } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from '../respond'

export const fetch = Effect.gen(function* () {
  const params = yield* HttpRouter.params
  const id = params.id as ChallengeId
  return yield* challenges.fetch(id).pipe(
    Effect.matchEffect({
      onFailure: (err) => response(err, { op: 'challenges.fetch' }),
      onSuccess: (challenge) => response(challenge),
    }),
  )
})
