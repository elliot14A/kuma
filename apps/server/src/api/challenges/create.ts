import { Challenge } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect, Schema } from 'effect'
import { HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

const { id: _id, ...createFields } = Challenge.fields
const CreateChallengeBody = Schema.Struct(createFields)

export const create = Effect.gen(function* () {
  const payload = yield* HttpServerRequest.schemaBodyJson(CreateChallengeBody)
  return yield* challenges.create(payload)
}).pipe(
  Effect.matchEffect({
    onFailure: (err) => response(err, { op: 'challenges.create' }),
    onSuccess: (challenge) =>
      response(challenge, {
        status: 201,
        message: 'challenge created successfully',
      }),
  }),
)
