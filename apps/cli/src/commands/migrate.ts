import { debug, info, Pg, runMigrations } from '@kuma/infra'
import { Effect } from 'effect'
import { Command } from 'effect/unstable/cli'

export const migrateCommand = Command.make('migrate', {}, () =>
  Effect.gen(function* () {
    yield* info('starting database migrations', { command: 'migrate' })
    yield* debug('executing migration runner with postgres layer')
    yield* runMigrations().pipe(Effect.provide(Pg))
    yield* info('database migrations completed successfully', { command: 'migrate' })
  }),
).pipe(Command.withDescription('run postgres database migrations'))
