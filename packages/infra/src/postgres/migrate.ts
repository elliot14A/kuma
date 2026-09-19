import { BunServices } from '@effect/platform-bun'
import { PgMigrator } from '@effect/sql-pg'
import { Effect } from 'effect'

export const runMigrations = (dir = 'migrations') =>
  PgMigrator.run({
    loader: PgMigrator.fromFileSystem(dir),
  }).pipe(Effect.provide(BunServices.layer))
