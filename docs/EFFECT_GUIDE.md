# Effect v4 Quick Reference & Conventions

This guide provides the standard Effect v4 patterns used across the Kuma monorepo.

---

## 1. Schema & Branded Types

In Effect v4, Schema is imported directly from `"effect"`:

```typescript
import { Schema } from "effect"

// Branded Types
export const ChallengeId = Schema.String.pipe(Schema.brand("ChallengeId"))
export type ChallengeId = typeof ChallengeId.Type

// Structs
export const Challenge = Schema.Struct({
  id: ChallengeId,
  title: Schema.String,
  description: Schema.String,
  language: Schema.Literal("typescript", "python"),
  starterFiles: Schema.Record({ key: Schema.String, value: Schema.String }),
  testFiles: Schema.Record({ key: Schema.String, value: Schema.String }),
  timeLimitMinutes: Schema.Number,
})
export type Challenge = typeof Challenge.Type

// Encoding / Decoding
const decodeChallenge = Schema.decodeUnknown(Challenge)
const encodeChallenge = Schema.encode(Challenge)
```

---

## 2. Tagged Services & Layers

Define services using `Context.Tag` and provide implementations with `Layer`:

```typescript
import { PgClient } from "@effect/sql-pg"
import { DatabaseConfig } from "@kuma/domain"
import { Effect, Layer } from "effect"

// Layer standard: Pg exports connection layer configured from domain DatabaseConfig
export const Pg = PgClient.layerConfig({
  url: DatabaseConfig.pipe(Config.map((c) => c.url)),
})

// Action operations resolve the client via Context Tag
export const create = (payload: CreateInput) =>
  Effect.gen(function* () {
    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`
      insert into challenges (title, starter_files)
      values (${payload.title}, ${sql.json(payload.starterFiles)})
      returning id, title, starter_files as "starterFiles"
    `
    return rows[0]
  })
```

---

## 3. Canonical DomainError & Error Channels

Use the central `DomainError` in `packages/domain/src/error.ts` with standardized static constructors:

```typescript
import { DomainError } from "@kuma/domain"
import { Effect } from "effect"

export const fetchChallenge = (id: ChallengeId): Effect.Effect<Challenge, DomainError, PgClient.PgClient> =>
  Effect.gen(function* () {
    const sql = yield* PgClient.PgClient
    const rows = yield* sql<Challenge>`select * from challenges where id = ${id}`
    const challenge = rows[0]
    if (!challenge) {
      return yield* DomainError.notFound({ entity: "Challenge", id })
    }
    return challenge
  })
```

---

## 4. SQL Queries & JSON Parameterization

- Use direct typed queries: `sql<Challenge>`
- Column aliasing for camelCase mapping: `starter_files as "starterFiles"`
- JSON objects parameterization: `sql.json(data)`
- Map SQL driver errors to `DomainError`: `Effect.mapError((cause) => mapPostgresError(cause, 'insert', 'challenges.create'))`

---

## 5. Streaming with Effect Stream

For real-time terminal chunks and test execution logs:

```typescript
import { Stream, Effect } from "effect"

export const streamProcessLogs = (childProcess: any): Stream.Stream<string, Error> =>
  Stream.async<string, Error>((emit) => {
    childProcess.stdout.on("data", (chunk: Buffer) => {
      emit.single(chunk.toString("utf8"))
    })
    childProcess.on("error", (err: Error) => {
      emit.fail(err)
    })
    childProcess.on("close", () => {
      emit.end()
    })
  })
```
