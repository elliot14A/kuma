import { PgClient } from '@effect/sql-pg'
import { Effect } from 'effect'
import { mapPostgresError } from './error'

export interface Migration {
  readonly id: string
  readonly sql: string
}

export const loadMigrations = (dir?: string): Effect.Effect<Migration[], Error> =>
  Effect.tryPromise(async () => {
    const migrationsDir = dir ?? `${import.meta.dir}/migrations`
    const glob = new Bun.Glob('*.sql')
    const files = Array.from(glob.scanSync(migrationsDir)).sort()

    return Promise.all(
      files.map(async (file) => ({
        id: file.replace(/\.sql$/, ''),
        sql: (await Bun.file(`${migrationsDir}/${file}`).text()).trim(),
      })),
    )
  })

export const runMigrations = (migrationsDir?: string) =>
  Effect.gen(function* () {
    const sql = yield* PgClient.PgClient
    const migrations = yield* loadMigrations(migrationsDir).pipe(
      Effect.mapError((err) => mapPostgresError(err, 'load_migrations', 'postgres.migrate')),
    )

    yield* sql`
      create table if not exists _kuma_migrations (
        id varchar(255) primary key,
        applied_at timestamptz not null default now()
      );
    `.pipe(
      Effect.mapError((err) =>
        mapPostgresError(err, 'create_migrations_table', 'postgres.migrate'),
      ),
    )

    const appliedRows = yield* sql<{ id: string }>`
      select id from _kuma_migrations order by id asc;
    `.pipe(Effect.mapError((err) => mapPostgresError(err, 'select_migrations', 'postgres.migrate')))

    const appliedSet = new Set(appliedRows.map((r) => r.id))

    for (const migration of migrations) {
      if (!appliedSet.has(migration.id)) {
        yield* sql
          .unsafe(migration.sql)
          .pipe(
            Effect.mapError((err) =>
              mapPostgresError(err, `apply_${migration.id}`, 'postgres.migrate'),
            ),
          )
        yield* sql`
          insert into _kuma_migrations (id) values (${migration.id});
        `.pipe(
          Effect.mapError((err) =>
            mapPostgresError(err, `record_${migration.id}`, 'postgres.migrate'),
          ),
        )
      }
    }
  })
