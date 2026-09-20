import { Config, Effect, Redacted, Result, Schema } from 'effect'

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

export const SandboxDriver = Schema.Literals(['local', 'nebius'])
export type SandboxDriver = typeof SandboxDriver.Type

export const SandboxConfig = Config.all({
  driver: Config.schema(Schema.Literals(['local', 'nebius']), 'KUMA_SANDBOX_DRIVER').pipe(
    Config.withDefault('local'),
  ),
  maxConcurrency: Config.Number('KUMA_SANDBOX_MAX_CONCURRENCY').pipe(Config.withDefault(12)),
  nebiusApiKey: Config.schema(Schema.optional(Schema.String), 'KUMA_NEBIUS_API_KEY').pipe(
    Config.withDefault(undefined),
  ),
  nebiusEndpoint: Config.schema(Schema.optional(Schema.String), 'KUMA_NEBIUS_ENDPOINT').pipe(
    Config.withDefault('https://api.nebius.ai/v1/sandboxes'),
  ),
}).pipe(
  Config.mapEffect((c) => {
    if (c.driver === 'nebius' && !c.nebiusApiKey?.trim()) {
      const res = Schema.decodeUnknownResult(Schema.NonEmptyString)('')
      if (Result.isFailure(res)) {
        return Effect.fail(new Config.ConfigError(res.failure))
      }
    }
    return Effect.succeed(c)
  }),
)

export const AppConfig = {
  server: ServerConfig,
  database: DatabaseConfig,
  log: LogConfig,
  sandbox: SandboxConfig,
}
