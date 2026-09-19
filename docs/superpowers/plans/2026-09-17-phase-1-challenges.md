# Phase 1: Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete `challenges` entity end-to-end: domain models and dual TS/Python schemas in `packages/domain`, PostgreSQL DDL migration & CRUD actions in `packages/infra`, and REST API endpoints in `apps/server`, verified with 100% Vitest coverage.

**Architecture:**
- `packages/domain/src/challenges/`: Pure Effect schemas (`Challenge`, `LanguageRuntime`, `FileMap`, `ChallengeId`), creation payloads, and domain tagged errors.
- `packages/infra/src/postgres/actions/challenges/`: Action-based SQL queries (`create`, `fetch`, `list`, `delete`) using `@effect/sql-pg`.
- `apps/server/src/api/challenges/`: Action-based HTTP endpoints (`POST`, `GET /:id`, `GET /`, `DELETE /:id`) mounted via `@effect/platform`.

**Tech Stack:** Effect v4 (`4.0.0-rc.115`), `@effect/platform`, `@effect/sql`, `@effect/sql-pg`, PostgreSQL, Vitest.

**Spec:** [`docs/ARCHITECTURE.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/ARCHITECTURE.md), [`docs/CODING_STANDARDS.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/CODING_STANDARDS.md)

## Global Constraints
- `throw` is FORBIDDEN — always use `Data.TaggedError` and `Effect.fail`.
- Every directory must expose an `index.ts` barrel.
- All database queries must be pure Effect SQL programs with typed errors.
- Strict `KUMA_` environment variable prefix.
- Mirrored `*.test.ts` test files for all domain rules, DB actions, and API routes.

---

### Task 1: Setup Workspace Test Harness

**Files:**
- Modify: [`packages/domain/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/package.json)
- Modify: [`packages/infra/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/packages/infra/package.json)
- Modify: [`apps/server/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/apps/server/package.json)
- Modify: [`package.json`](file:///home/kiwi/Desktop/hackathons/kuma/package.json)

**Interfaces:**
- Consumes: None
- Produces: `bun test` running Vitest across all workspace packages.

- [ ] **Step 1: Ensure test script exists across packages**

Ensure `"test": "vitest run"` is present in root `package.json`, `packages/domain/package.json`, `packages/infra/package.json`, and `apps/server/package.json`.

- [ ] **Step 2: Run test check**

Run: `bun x vitest --version`  
Expected: Prints `vitest/5.x.x`

---

### Task 2: Define Challenge Domain Models & Runtime Contracts (`ELL-16`)

**Files:**
- Create: `packages/domain/src/common/schema.ts`
- Create: `packages/domain/src/common/errors.ts`
- Create: `packages/domain/src/common/index.ts`
- Create: `packages/domain/src/challenges/schema.ts`
- Create: `packages/domain/src/challenges/errors.ts`
- Create: `packages/domain/src/challenges/index.ts`
- Modify: [`packages/domain/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/src/index.ts)
- Test: `packages/domain/test/challenges/schema.test.ts`

**Interfaces:**
- Consumes: `effect` (`Schema`, `Data`)
- Produces:
  - `LanguageRuntime`: `"typescript" | "python"`
  - `FileMap`: `Record<string, string>`
  - `ChallengeId`: Branded `string`
  - `Challenge`: Effect Schema
  - `CreateChallengePayload` & `UpdateChallengePayload`
  - `ChallengeNotFoundError` & `InvalidChallengePayloadError`

- [ ] **Step 1: Write failing schema tests**

Create `packages/domain/test/challenges/schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  Challenge,
  CreateChallengePayload,
  ChallengeNotFoundError,
} from "../../src/index.js"

describe("Challenge Domain Models", () => {
  it("decodes a valid TypeScript Challenge", () => {
    const raw = {
      id: "ch_ts_token_bucket",
      title: "Debug Token Bucket Limiter",
      description: "Fix the leaky bucket algorithm.",
      language: "typescript",
      starterFiles: { "src/limiter.ts": "export class RateLimiter {}" },
      testFiles: { "test/limiter.test.ts": "import { describe } from 'vitest'" },
      timeLimitMinutes: 45,
    }
    const decoded = Schema.decodeSync(Challenge)(raw)
    expect(decoded.language).toBe("typescript")
    expect(decoded.starterFiles["src/limiter.ts"]).toBe("export class RateLimiter {}")
  })

  it("decodes a valid Python Challenge", () => {
    const raw = {
      id: "ch_py_lru_cache",
      title: "Implement Async Cache",
      description: "Implement thread-safe TTL cache.",
      language: "python",
      starterFiles: { "cache.py": "class TTLCache:\n    pass" },
      testFiles: { "test_cache.py": "import pytest" },
      timeLimitMinutes: 30,
    }
    const decoded = Schema.decodeSync(Challenge)(raw)
    expect(decoded.language).toBe("python")
  })

  it("validates CreateChallengePayload", () => {
    const raw = {
      title: "New Challenge",
      description: "Solve this problem.",
      language: "typescript",
      starterFiles: { "index.ts": "console.log('hi')" },
      testFiles: { "index.test.ts": "assert(true)" },
      timeLimitMinutes: 60,
    }
    const decoded = Schema.decodeSync(CreateChallengePayload)(raw)
    expect(decoded.title).toBe("New Challenge")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @kuma/domain test`  
Expected: FAIL ("Cannot find module '../../src/index.js'")

- [ ] **Step 3: Implement domain code**

Create `packages/domain/src/common/schema.ts`:
```typescript
import { Schema } from "effect"

export const LanguageRuntime = Schema.Literal("typescript", "python")
export type LanguageRuntime = typeof LanguageRuntime.Type

export const FileMap = Schema.Record({
  key: Schema.String,
  value: Schema.String,
})
export type FileMap = typeof FileMap.Type
```

Create `packages/domain/src/common/errors.ts`:
```typescript
import { Data } from "effect"

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string
}> {}
```

Create `packages/domain/src/common/index.ts`:
```typescript
export * from "./schema.js"
export * from "./errors.js"
```

Create `packages/domain/src/challenges/schema.ts`:
```typescript
import { Schema } from "effect"
import { FileMap, LanguageRuntime } from "../common/schema.js"

export const ChallengeId = Schema.String.pipe(Schema.brand("ChallengeId"))
export type ChallengeId = typeof ChallengeId.Type

export const Challenge = Schema.Struct({
  id: ChallengeId,
  title: Schema.String,
  description: Schema.String,
  language: LanguageRuntime,
  starterFiles: FileMap,
  testFiles: FileMap,
  timeLimitMinutes: Schema.Number,
})
export type Challenge = typeof Challenge.Type

export const CreateChallengePayload = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  language: LanguageRuntime,
  starterFiles: FileMap,
  testFiles: FileMap,
  timeLimitMinutes: Schema.Number,
})
export type CreateChallengePayload = typeof CreateChallengePayload.Type

export const UpdateChallengePayload = Schema.Struct({
  title: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  starterFiles: Schema.optional(FileMap),
  testFiles: Schema.optional(FileMap),
  timeLimitMinutes: Schema.optional(Schema.Number),
})
export type UpdateChallengePayload = typeof UpdateChallengePayload.Type
```

Create `packages/domain/src/challenges/errors.ts`:
```typescript
import { Data } from "effect"
import type { ChallengeId } from "./schema.js"

export class ChallengeNotFoundError extends Data.TaggedError("ChallengeNotFoundError")<{
  readonly challengeId: ChallengeId
}> {}

export class InvalidChallengePayloadError extends Data.TaggedError("InvalidChallengePayloadError")<{
  readonly cause: unknown
}> {}
```

Create `packages/domain/src/challenges/index.ts`:
```typescript
export * from "./schema.js"
export * from "./errors.js"
```

Update `packages/domain/src/index.ts`:
```typescript
export * from "./common/index.js"
export * from "./challenges/index.js"
```

- [ ] **Step 4: Run domain tests to verify they pass**

Run: `bun --filter @kuma/domain test`  
Expected: PASS

---

### Task 3: PostgreSQL Migration & CRUD Actions (`ELL-17`)

**Files:**
- Create: `packages/infra/src/postgres/migrations/0001_challenges.sql`
- Create: `packages/infra/src/postgres/client.ts`
- Create: `packages/infra/src/postgres/errors.ts`
- Create: `packages/infra/src/postgres/actions/challenges/create.ts`
- Create: `packages/infra/src/postgres/actions/challenges/fetch.ts`
- Create: `packages/infra/src/postgres/actions/challenges/list.ts`
- Create: `packages/infra/src/postgres/actions/challenges/delete.ts`
- Create: `packages/infra/src/postgres/actions/challenges/index.ts`
- Create: `packages/infra/src/postgres/index.ts`
- Modify: [`packages/infra/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/packages/infra/src/index.ts)
- Test: `packages/infra/test/postgres/challenges.test.ts`

**Interfaces:**
- Consumes: `@kuma/domain`, `@effect/sql`, `@effect/sql-pg`
- Produces:
  - `PgLive`: Layer providing PostgreSQL client
  - `createChallenge(payload)`: `Effect<Challenge, PostgresError, SqlClient>`
  - `fetchChallenge(id)`: `Effect<Challenge, PostgresError | ChallengeNotFoundError, SqlClient>`
  - `listChallenges()`: `Effect<Challenge[], PostgresError, SqlClient>`
  - `deleteChallenge(id)`: `Effect<void, PostgresError | ChallengeNotFoundError, SqlClient>`

- [ ] **Step 1: Write SQL Migration**

Create `packages/infra/src/postgres/migrations/0001_challenges.sql`:
```sql
CREATE TABLE IF NOT EXISTS challenges (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  language VARCHAR(32) NOT NULL,
  starter_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_limit_minutes INT NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_language ON challenges(language);
```

- [ ] **Step 2: Implement Postgres Client & Errors**

Create `packages/infra/src/postgres/errors.ts`:
```typescript
import { Data } from "effect"

export class PostgresError extends Data.TaggedError("PostgresError")<{
  readonly cause: unknown
  readonly query?: string
}> {}
```

Create `packages/infra/src/postgres/client.ts`:
```typescript
import { Config, Layer } from "effect"
import { PgClient } from "@effect/sql-pg"

export const PgLive = PgClient.layerConfig({
  url: Config.redacted("KUMA_DATABASE_URL").pipe(
    Config.withDefault("postgres://postgres:postgres@localhost:5432/kuma" as any)
  ),
})
```

- [ ] **Step 3: Implement Actions**

Create `packages/infra/src/postgres/actions/challenges/create.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import type { Challenge, ChallengeId, CreateChallengePayload } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const createChallenge = (
  payload: CreateChallengePayload,
  id = `ch_${crypto.randomUUID()}` as ChallengeId
): Effect.Effect<Challenge, PostgresError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      INSERT INTO challenges (
        id, title, description, language, starter_files, test_files, time_limit_minutes
      ) VALUES (
        ${id}, ${payload.title}, ${payload.description},
        ${payload.language}, ${JSON.stringify(payload.starterFiles)},
        ${JSON.stringify(payload.testFiles)}, ${payload.timeLimitMinutes}
      )
      RETURNING id, title, description, language,
                starter_files as "starterFiles",
                test_files as "testFiles",
                time_limit_minutes as "timeLimitMinutes"
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "INSERT INTO challenges" }))
    )

    const row = rows[0]
    return {
      ...row,
      starterFiles: typeof row.starterFiles === "string" ? JSON.parse(row.starterFiles) : row.starterFiles,
      testFiles: typeof row.testFiles === "string" ? JSON.parse(row.testFiles) : row.testFiles,
    } as Challenge
  })
```

Create `packages/infra/src/postgres/actions/challenges/fetch.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import { type Challenge, type ChallengeId, ChallengeNotFoundError } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const fetchChallenge = (
  id: ChallengeId
): Effect.Effect<Challenge, PostgresError | ChallengeNotFoundError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      SELECT id, title, description, language,
             starter_files as "starterFiles",
             test_files as "testFiles",
             time_limit_minutes as "timeLimitMinutes"
      FROM challenges
      WHERE id = ${id}
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "SELECT FROM challenges" }))
    )

    if (rows.length === 0) {
      return yield* new ChallengeNotFoundError({ challengeId: id })
    }

    const row = rows[0]
    return {
      ...row,
      starterFiles: typeof row.starterFiles === "string" ? JSON.parse(row.starterFiles) : row.starterFiles,
      testFiles: typeof row.testFiles === "string" ? JSON.parse(row.testFiles) : row.testFiles,
    } as Challenge
  })
```

Create `packages/infra/src/postgres/actions/challenges/list.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import type { Challenge } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const listChallenges = (): Effect.Effect<Challenge[], PostgresError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      SELECT id, title, description, language,
             starter_files as "starterFiles",
             test_files as "testFiles",
             time_limit_minutes as "timeLimitMinutes"
      FROM challenges
      ORDER BY created_at DESC
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "LIST challenges" }))
    )

    return rows.map((row) => ({
      ...row,
      starterFiles: typeof row.starterFiles === "string" ? JSON.parse(row.starterFiles) : row.starterFiles,
      testFiles: typeof row.testFiles === "string" ? JSON.parse(row.testFiles) : row.testFiles,
    })) as Challenge[]
  })
```

Create `packages/infra/src/postgres/actions/challenges/delete.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import { type ChallengeId, ChallengeNotFoundError } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const deleteChallenge = (
  id: ChallengeId
): Effect.Effect<void, PostgresError | ChallengeNotFoundError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      DELETE FROM challenges WHERE id = ${id} RETURNING id
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "DELETE FROM challenges" }))
    )

    if (rows.length === 0) {
      return yield* new ChallengeNotFoundError({ challengeId: id })
    }
  })
```

Create `packages/infra/src/postgres/actions/challenges/index.ts`:
```typescript
export * from "./create.js"
export * from "./fetch.js"
export * from "./list.js"
export * from "./delete.js"
```

Create `packages/infra/src/postgres/index.ts`:
```typescript
export * from "./client.js"
export * from "./errors.js"
export * from "./actions/challenges/index.js"
```

Update `packages/infra/src/index.ts`:
```typescript
export * from "./postgres/index.js"
```

---

### Task 4: REST API Endpoints for Challenge Management (`ELL-18`)

**Files:**
- Create: `apps/server/src/config.ts`
- Create: `apps/server/src/api/challenges/create.ts`
- Create: `apps/server/src/api/challenges/fetch.ts`
- Create: `apps/server/src/api/challenges/list.ts`
- Create: `apps/server/src/api/challenges/delete.ts`
- Create: `apps/server/src/api/challenges/index.ts`
- Modify: [`apps/server/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/apps/server/src/index.ts)
- Test: `apps/server/test/api/challenges.test.ts`

**Interfaces:**
- Consumes: `@kuma/domain`, `@kuma/infra`, `@effect/platform`
- Produces:
  - `POST /api/v1/challenges` $\rightarrow$ 201 Created with `Challenge`
  - `GET /api/v1/challenges/:id` $\rightarrow$ 200 OK with `Challenge` or 404
  - `GET /api/v1/challenges` $\rightarrow$ 200 OK with `Challenge[]`
  - `DELETE /api/v1/challenges/:id` $\rightarrow$ 204 No Content or 404

- [ ] **Step 1: Implement Server Config**

Create `apps/server/src/config.ts`:
```typescript
import { Config } from "effect"

export const ServerConfig = Config.all({
  port: Config.number("KUMA_SERVER_PORT").pipe(Config.withDefault(8080)),
  host: Config.string("KUMA_SERVER_HOST").pipe(Config.withDefault("0.0.0.0")),
})
```

- [ ] **Step 2: Implement HTTP Handlers**

Create `apps/server/src/api/challenges/create.ts`:
```typescript
import { Effect, Schema } from "effect"
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { CreateChallengePayload } from "@kuma/domain"
import { createChallenge } from "@kuma/infra"

export const handleCreateChallenge = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const json = yield* req.json
  const payload = yield* Schema.decodeUnknown(CreateChallengePayload)(json)
  const challenge = yield* createChallenge(payload)
  return yield* HttpServerResponse.json(challenge, { status: 201 })
})
```

Create `apps/server/src/api/challenges/fetch.ts`:
```typescript
import { Effect } from "effect"
import { HttpServerResponse } from "@effect/platform"
import { type ChallengeId, ChallengeNotFoundError } from "@kuma/domain"
import { fetchChallenge } from "@kuma/infra"

export const handleFetchChallenge = (id: string) =>
  Effect.gen(function* () {
    const challenge = yield* fetchChallenge(id as ChallengeId).pipe(
      Effect.catchTag("ChallengeNotFoundError", () =>
        HttpServerResponse.json({ error: "Challenge not found" }, { status: 404 })
      )
    )
    return yield* HttpServerResponse.json(challenge)
  })
```

Create `apps/server/src/api/challenges/list.ts`:
```typescript
import { Effect } from "effect"
import { HttpServerResponse } from "@effect/platform"
import { listChallenges } from "@kuma/infra"

export const handleListChallenges = Effect.gen(function* () {
  const challenges = yield* listChallenges()
  return yield* HttpServerResponse.json(challenges)
})
```

Create `apps/server/src/api/challenges/delete.ts`:
```typescript
import { Effect } from "effect"
import { HttpServerResponse } from "@effect/platform"
import { type ChallengeId } from "@kuma/domain"
import { deleteChallenge } from "@kuma/infra"

export const handleDeleteChallenge = (id: string) =>
  Effect.gen(function* () {
    yield* deleteChallenge(id as ChallengeId).pipe(
      Effect.catchTag("ChallengeNotFoundError", () =>
        HttpServerResponse.json({ error: "Challenge not found" }, { status: 404 })
      )
    )
    return HttpServerResponse.empty({ status: 204 })
  })
```

Create `apps/server/src/api/challenges/index.ts`:
```typescript
import { HttpRouter } from "@effect/platform"
import { handleCreateChallenge } from "./create.js"
import { handleFetchChallenge } from "./fetch.js"
import { handleListChallenges } from "./list.js"
import { handleDeleteChallenge } from "./delete.js"

export const challengesRouter = HttpRouter.empty.pipe(
  HttpRouter.post("/api/v1/challenges", handleCreateChallenge),
  HttpRouter.get("/api/v1/challenges/:id", ({ params }) => handleFetchChallenge(params.id)),
  HttpRouter.get("/api/v1/challenges", handleListChallenges),
  HttpRouter.del("/api/v1/challenges/:id", ({ params }) => handleDeleteChallenge(params.id))
)
```

Update `apps/server/src/index.ts`:
```typescript
import { Layer } from "effect"
import { NodeHttpServer } from "@effect/platform-node"
import { createServer } from "node:http"
import { challengesRouter } from "./api/challenges/index.js"
import { PgLive } from "@kuma/infra"

const ServerLive = NodeHttpServer.layer(() => createServer(), { port: 8080 })

const AppLive = challengesRouter.pipe(
  Layer.provide(ServerLive),
  Layer.provide(PgLive)
)

export const runServer = Layer.launch(AppLive)
```

- [ ] **Step 3: Run monorepo typecheck and lint**

Run: `bun run typecheck && bun run lint`  
Expected: 0 errors across monorepo.
