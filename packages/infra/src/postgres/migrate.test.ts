import { BunServices } from '@effect/platform-bun'
import { PgMigrator } from '@effect/sql-pg'
import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'

describe('Postgres Migrations', () => {
  it('loads migration files in order using PgMigrator.fromFileSystem', async () => {
    const loader = PgMigrator.fromFileSystem('migrations').pipe(Effect.provide(BunServices.layer))
    const migrations = await Effect.runPromise(loader)
    expect(migrations.length).toBeGreaterThanOrEqual(2)
    expect(migrations[0]?.[0]).toBe(1)
    expect(migrations[0]?.[1]).toBe('init')
    expect(migrations[1]?.[0]).toBe(2)
    expect(migrations[1]?.[1]).toBe('challenges')
  })
})
