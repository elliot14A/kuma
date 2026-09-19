import { PgClient } from '@effect/sql-pg'
import { Effect } from 'effect'

export default Effect.gen(function* () {
  const sql = yield* PgClient.PgClient

  yield* sql`
    create or replace function manage_updated_at(_tbl regclass) returns void as $$
    begin
        execute format('create or replace trigger set_updated_at before update on %s
                        for each row execute procedure set_updated_at()', _tbl);
    end;
    $$ language plpgsql;
  `

  yield* sql`
    create or replace function set_updated_at() returns trigger as $$
    begin
        if (
            new is distinct from old and
            new.updated_at is not distinct from old.updated_at
        ) then
            new.updated_at := current_timestamp;
        end if;
        return new;
    end;
    $$ language plpgsql;
  `

  yield* sql`create extension if not exists "uuid-ossp"`
  yield* sql`create collation if not exists case_insensitive (provider = icu, locale = 'und-u-ks-level2')`
})
