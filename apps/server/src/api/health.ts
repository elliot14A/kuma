import { Effect } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { response } from './respond'

export const health = Effect.gen(function* () {
  return yield* response({ status: 'ok' }, { message: 'service is healthy', status: 200 })
})

export const healthRoutes = [HttpRouter.route('GET', '/health', health)]
