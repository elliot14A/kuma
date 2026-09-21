import { debug, info } from '@kuma/infra'
import { runServer } from '@kuma/server'
import { Effect } from 'effect'
import { Command } from 'effect/unstable/cli'

export const serverCommand = Command.make('server', {}, () =>
  Effect.gen(function* () {
    yield* info('starting http api server', { command: 'server' })
    yield* debug('launching server effect runtime')
    yield* runServer
  }),
).pipe(Command.withDescription('start http api server'))
