import { PgClient } from '@effect/sql-pg'
import { DatabaseConfig } from '@kuma/domain'

export const Pg = PgClient.layerConfig({
  url: DatabaseConfig.url,
})
