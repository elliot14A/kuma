import { Effect, Layer } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from './respond'

export const health = Effect.gen(function* () {
  return yield* response({ status: 'ok' }, { message: 'service is healthy' })
})

export const healthRouter = Layer.mergeAll(HttpRouter.add('GET', '/api/v1/health', health))
