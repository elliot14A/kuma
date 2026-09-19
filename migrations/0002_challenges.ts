import { PgClient } from '@effect/sql-pg'
import { Effect } from 'effect'

export default Effect.gen(function* () {
  const sql = yield* PgClient.PgClient

  yield* sql`
    create table if not exists challenges (
      id uuid primary key default uuid_generate_v4(),
      title varchar(255) not null,
      description text not null,
      language varchar(32) not null,
      starter_files jsonb not null default '{}'::jsonb,
      test_files jsonb not null default '{}'::jsonb,
      time_limit_minutes int not null default 45,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  yield* sql`create index if not exists idx_challenges_language on challenges(language)`
  yield* sql`select manage_updated_at('challenges')`
})
