import { Pg, runMigrations } from '@kuma/infra'
import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* Effect.log('[kuma-cli] Running database migrations...')
  yield* runMigrations().pipe(Effect.provide(Pg))
  yield* Effect.log('[kuma-cli] Database migrations completed successfully.')
})
