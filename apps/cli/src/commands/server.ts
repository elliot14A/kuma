import { debug, info } from '@kuma/infra'
import { runServer } from '@kuma/server'
import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* info('starting http api server', { command: 'server' })
  yield* debug('launching server effect runtime')
  yield* runServer
})
