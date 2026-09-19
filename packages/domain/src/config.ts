import { Config, Redacted, Schema } from 'effect'

export const ServerConfig = {
  port: Config.Number('KUMA_SERVER_PORT').pipe(Config.withDefault(8080)),
  host: Config.String('KUMA_SERVER_HOST').pipe(Config.withDefault('0.0.0.0')),
  env: Config.String('KUMA_ENV').pipe(Config.withDefault('development')),
}

export const DatabaseConfig = {
  url: Config.Redacted('KUMA_DATABASE_URL').pipe(
    Config.withDefault(Redacted.make('postgres://postgres:postgres@localhost:5432/kuma')),
  ),
}

export const LogConfig = {
  format: Config.schema(
    Schema.Literals(['text', 'compact', 'json', 'pretty']),
    'KUMA_LOG_FORMAT',
  ).pipe(Config.withDefault('text')),
  level: Config.schema(
    Schema.Literals(['all', 'trace', 'debug', 'info', 'warn', 'error', 'none']),
    'KUMA_LOG_LEVEL',
  ).pipe(Config.withDefault('info')),
}

export const AppConfig = {
  server: ServerConfig,
  database: DatabaseConfig,
  log: LogConfig,
}
