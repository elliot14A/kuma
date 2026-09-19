import { runServer } from '@kuma/server'
import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* Effect.log('[kuma-cli] Starting HTTP API server...')
  yield* runServer
})
