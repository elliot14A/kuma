import { Effect } from 'effect'
import { describe, expect, it } from 'vitest'
import { loadMigrations } from './migrate'

describe('Postgres Migrations', () => {
  it('loads sql migration files in alphabetical order using Bun', async () => {
    const migrations = await Effect.runPromise(loadMigrations())
    expect(migrations.length).toBeGreaterThanOrEqual(2)
    expect(migrations[0]?.id).toBe('0001_init')
    expect(migrations[0]?.sql).toContain('manage_updated_at')
    expect(migrations[0]?.sql).toContain('uuid-ossp')
    expect(migrations[1]?.id).toBe('0002_challenges')
    expect(migrations[1]?.sql).toContain('challenges')
  })
})
