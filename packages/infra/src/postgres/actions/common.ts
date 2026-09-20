import { PgClient } from '@effect/sql-pg'
import { Effect, Layer } from 'effect'

export interface CountRow {
  readonly count: number
}

export const createMockSqlLayer = (
  handler: (strings: TemplateStringsArray, values: unknown[]) => Effect.Effect<unknown[], unknown>,
): Layer.Layer<PgClient.PgClient> => {
  const mockSql = Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => handler(strings, values),
    {
      safe: null,
      withoutTransforms: () => mockSql,
      reserve: Effect.die('not implemented'),
      withTransaction: <A, E, R>(self: Effect.Effect<A, E, R>) => self,
      reactive: () => Effect.die('not implemented'),
      reactiveMailbox: () => Effect.die('not implemented'),
      config: {},
      json: (data: unknown) => data,
      listen: () => Effect.die('not implemented'),
      notify: () => Effect.die('not implemented'),
    },
  )

  return Layer.succeed(PgClient.PgClient, mockSql as unknown as PgClient.PgClient)
}
