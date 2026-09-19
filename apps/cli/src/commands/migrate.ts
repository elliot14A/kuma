import { debug, info, Pg, runMigrations } from '@kuma/infra'
import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* info('starting database migrations', { command: 'migrate' })
  yield* debug('executing migration runner with postgres layer')
  yield* runMigrations().pipe(Effect.provide(Pg))
  yield* info('database migrations completed successfully', { command: 'migrate' })
})
