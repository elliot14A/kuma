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
import { Context, Effect, Layer, Stream } from "effect"
import type { ExecutionChunk, LanguageRuntime, FileMap } from "@kuma/domain"
import type { SandboxError } from "./errors.js"

export class ExecutionService extends Context.Tag("ExecutionService")<
  ExecutionService,
  {
    readonly execute: (
      files: FileMap,
      language: LanguageRuntime,
      timeoutSeconds: number
    ) => Stream.Stream<ExecutionChunk, SandboxError>
  }
>() {}

// Live Layer Implementation
export const ExecutionServiceDockerLive = Layer.succeed(
  ExecutionService,
  ExecutionService.of({
    execute: (files, language, timeoutSeconds) => {
      // Stream execution chunks
      return Stream.make(/* ... */)
    },
  })
)
```

---

## 3. Tagged Errors & Error Channels

Always use `Data.TaggedError`:

```typescript
import { Data, Effect } from "effect"

export class SessionNotFoundError extends Data.TaggedError("SessionNotFoundError")<{
  readonly sessionId: string
}> {}

export const findSession = (id: string): Effect.Effect<Session, SessionNotFoundError> =>
  Effect.gen(function* () {
    const session = yield* db.lookup(id)
    if (!session) {
      return yield* new SessionNotFoundError({ sessionId: id })
    }
    return session
  })
```

---

## 4. Streaming with Effect Stream

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
