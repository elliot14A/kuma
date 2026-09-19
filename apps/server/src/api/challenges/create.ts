import { Challenge, DomainError } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { Effect, Schema } from 'effect'
import { HttpServerRequest } from 'effect/unstable/http'
import { response } from '../respond'

const { id: _id, ...createFields } = Challenge.fields
const CreateChallengeBody = Schema.Struct(createFields)

export const create = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const json = yield* req.json.pipe(Effect.orElseSucceed(() => null))
  if (json === null) {
    return yield* response(
      DomainError.invalidInput({ message: 'Invalid JSON request body', op: 'challenges.create' }),
    )
  }

  const payloadResult = yield* Schema.decodeUnknownEffect(CreateChallengeBody)(json).pipe(
    Effect.exit,
  )
  if (payloadResult._tag === 'Failure') {
    return yield* response(
      DomainError.invalidInput({
        message: 'Invalid challenge payload structure',
        cause: payloadResult.cause,
        op: 'challenges.create',
      }),
    )
  }

  return yield* challenges.create(payloadResult.value).pipe(
    Effect.matchEffect({
      onFailure: (err) => response(err, { op: 'challenges.create' }),
      onSuccess: (challenge) => response(challenge, { status: 201 }),
    }),
  )
})
