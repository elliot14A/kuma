import { PgClient } from '@effect/sql-pg'
import { Effect } from 'effect'

export default Effect.gen(function* () {
  const sql = yield* PgClient.PgClient

  yield* sql`
    create table if not exists assessments (
      id uuid primary key default uuid_generate_v4(),
      candidate_name varchar(255) not null,
      candidate_email varchar(255),
      status varchar(32) not null default 'invited',
      started_at timestamptz,
      submitted_at timestamptz,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  yield* sql`create index if not exists idx_assessments_status on assessments(status)`
  yield* sql`create index if not exists idx_assessments_metadata on assessments using gin(metadata)`
  yield* sql`select manage_updated_at('assessments')`

  yield* sql`
    create table if not exists assessment_challenges (
      assessment_id uuid not null references assessments(id) on delete cascade,
      challenge_id uuid not null references challenges(id) on delete restrict,
      sort_order int not null default 0,
      created_at timestamptz not null default now(),
      primary key (assessment_id, challenge_id)
    )
  `

  yield* sql`create index if not exists idx_assessment_challenges_challenge_id on assessment_challenges(challenge_id)`
  yield* sql`create index if not exists idx_assessment_challenges_sort_order on assessment_challenges(assessment_id, sort_order)`
})
