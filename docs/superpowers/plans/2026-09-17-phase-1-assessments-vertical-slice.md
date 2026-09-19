# Phase 1: Assessments End-to-End Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete `assessments` entity end-to-end: pure domain schemas/rules in `packages/domain`, PostgreSQL DDL migrations & Effect SQL actions in `packages/infra`, and HTTP route handlers in `apps/server`, verified with 100% TDD test coverage.

**Architecture:**
- `packages/domain/src/assessments/`: Pure Effect schemas (`AssessmentSession`, `SessionStatus`, `SessionId`), state transition rules, expiry calculators, and domain tagged errors.
- `packages/infra/src/postgres/actions/assessments/`: Schema-driven SQL queries (`create`, `fetch`, `list`, `update`) powered by `@effect/sql-pg`.
- `apps/server/src/api/assessments/`: Action-based HTTP route handlers mounted with `@effect/platform` and `config.ts`.

**Tech Stack:** Effect v4 (`4.0.0-rc.115`), `@effect/platform`, `@effect/sql`, `@effect/sql-pg`, PostgreSQL, Vitest.

**Spec:** [`WORKFLOW.md`](file:///home/kiwi/Desktop/hackathons/kuma/WORKFLOW.md), [`docs/ARCHITECTURE.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/ARCHITECTURE.md), [`docs/CODING_STANDARDS.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/CODING_STANDARDS.md)

## Global Constraints
- Strict `throw` prohibition — always use `Data.TaggedError` and `Effect.fail`.
- Every directory must expose an `index.ts` barrel.
- All database queries must be pure Effect SQL programs with typed errors.
- Strict `KUMA_` environment variable prefix.
- Mirrored `*.test.ts` test files for all domain rules, DB actions, and API routes.

---

### Task 1: Setup Workspace Test Scripts & Database Harness

**Files:**
- Modify: [`package.json`](file:///home/kiwi/Desktop/hackathons/kuma/package.json)
- Modify: [`packages/domain/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/package.json)
- Modify: [`packages/infra/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/packages/infra/package.json)
- Modify: [`apps/server/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/apps/server/package.json)

**Interfaces:**
- Consumes: None
- Produces: `bun test` running Vitest across all workspace packages.

- [ ] **Step 1: Add test scripts to packages**

In `packages/domain/package.json`, `packages/infra/package.json`, and `apps/server/package.json`, ensure `"test": "vitest run"` is present.

- [ ] **Step 2: Verify Vitest execution**

Run: `bun x vitest run`  
Expected: Runs Vitest across workspace.

---

### Task 2: Pure Domain Schemas & Rules (`packages/domain/src/assessments/`)

**Files:**
- Create: `packages/domain/src/common/schema.ts`
- Create: `packages/domain/src/common/errors.ts`
- Create: `packages/domain/src/common/index.ts`
- Create: `packages/domain/src/assessments/schema.ts`
- Create: `packages/domain/src/assessments/transition.ts`
- Create: `packages/domain/src/assessments/expiry.ts`
- Create: `packages/domain/src/assessments/errors.ts`
- Create: `packages/domain/src/assessments/index.ts`
- Modify: [`packages/domain/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/src/index.ts)
- Test: `packages/domain/test/assessments/transition.test.ts`
- Test: `packages/domain/test/assessments/expiry.test.ts`

**Interfaces:**
- Consumes: `effect` (`Schema`, `Data`)
- Produces:
  - `SessionId`: Branded string
  - `SessionStatus`: `"invited" | "active" | "submitted" | "expired"`
  - `AssessmentSession`: Effect Schema
  - `transitionSession(session, targetStatus)`: Returns updated session or fails with `InvalidTransitionError`
  - `calculateRemainingSeconds(session, now)`: Returns remaining time in seconds

- [ ] **Step 1: Write failing transition and expiry tests**

Create `packages/domain/test/assessments/transition.test.ts`:
```typescript
import { describe, expect, it } from "vitest"
import {
  type AssessmentSession,
  transitionSession,
  InvalidTransitionError,
} from "../../src/index.js"

describe("Assessment Session Transition FSM", () => {
  const baseSession: AssessmentSession = {
    id: "sess_1" as any,
    challengeId: "ch_1" as any,
    candidateName: "Alex",
    language: "typescript",
    status: "invited",
    activeFiles: { "src/index.ts": "export const x = 1" },
    startedAt: null,
    submittedAt: null,
    timeLimitMinutes: 45,
  }

  it("transitions from invited to active", () => {
    const updated = transitionSession(baseSession, "active")
    expect(updated.status).toBe("active")
    expect(updated.startedAt).toBeDefined()
  })

  it("transitions from active to submitted", () => {
    const activeSession: AssessmentSession = { ...baseSession, status: "active", startedAt: Date.now() }
    const updated = transitionSession(activeSession, "submitted")
    expect(updated.status).toBe("submitted")
    expect(updated.submittedAt).toBeDefined()
  })

  it("fails to transition from submitted back to active", () => {
    const submittedSession: AssessmentSession = { ...baseSession, status: "submitted" }
    expect(() => transitionSession(submittedSession, "active")).toThrowError()
  })
})
```

Create `packages/domain/test/assessments/expiry.test.ts`:
```typescript
import { describe, expect, it } from "vitest"
import {
  type AssessmentSession,
  calculateRemainingSeconds,
} from "../../src/index.js"

describe("Assessment Session Expiry Calculator", () => {
  it("calculates remaining seconds for active session", () => {
    const now = 1000000
    const session: AssessmentSession = {
      id: "sess_1" as any,
      challengeId: "ch_1" as any,
      candidateName: "Alex",
      language: "typescript",
      status: "active",
      activeFiles: {},
      startedAt: now - 300000, // started 5 mins ago
      submittedAt: null,
      timeLimitMinutes: 45,
    }
    // 45m - 5m = 40m = 2400s
    expect(calculateRemainingSeconds(session, now)).toBe(2400)
  })

  it("returns 0 when time limit exceeded", () => {
    const now = 1000000
    const session: AssessmentSession = {
      id: "sess_1" as any,
      challengeId: "ch_1" as any,
      candidateName: "Alex",
      language: "typescript",
      status: "active",
      activeFiles: {},
      startedAt: now - 3000000, // started 50 mins ago (limit 45)
      submittedAt: null,
      timeLimitMinutes: 45,
    }
    expect(calculateRemainingSeconds(session, now)).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

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

Create `packages/domain/src/assessments/schema.ts`:
```typescript
import { Schema } from "effect"
import { FileMap, LanguageRuntime } from "../common/schema.js"

export const SessionId = Schema.String.pipe(Schema.brand("SessionId"))
export type SessionId = typeof SessionId.Type

export const ChallengeId = Schema.String.pipe(Schema.brand("ChallengeId"))
export type ChallengeId = typeof ChallengeId.Type

export const SessionStatus = Schema.Literal("invited", "active", "submitted", "expired")
export type SessionStatus = typeof SessionStatus.Type

export const AssessmentSession = Schema.Struct({
  id: SessionId,
  challengeId: ChallengeId,
  candidateName: Schema.String,
  language: LanguageRuntime,
  status: SessionStatus,
  activeFiles: FileMap,
  startedAt: Schema.NullOr(Schema.Number),
  submittedAt: Schema.NullOr(Schema.Number),
  timeLimitMinutes: Schema.Number,
})
export type AssessmentSession = typeof AssessmentSession.Type

export const CreateAssessmentPayload = Schema.Struct({
  challengeId: ChallengeId,
  candidateName: Schema.String,
  language: LanguageRuntime,
  initialFiles: FileMap,
  timeLimitMinutes: Schema.Number,
})
export type CreateAssessmentPayload = typeof CreateAssessmentPayload.Type

export const UpdateAssessmentPayload = Schema.Struct({
  activeFiles: Schema.optional(FileMap),
  status: Schema.optional(SessionStatus),
})
export type UpdateAssessmentPayload = typeof UpdateAssessmentPayload.Type
```

Create `packages/domain/src/assessments/errors.ts`:
```typescript
import { Data } from "effect"
import type { SessionId, SessionStatus } from "./schema.js"

export class SessionNotFoundError extends Data.TaggedError("SessionNotFoundError")<{
  readonly sessionId: SessionId
}> {}

export class InvalidTransitionError extends Data.TaggedError("InvalidTransitionError")<{
  readonly currentStatus: SessionStatus
  readonly targetStatus: SessionStatus
}> {}

export class SessionExpiredError extends Data.TaggedError("SessionExpiredError")<{
  readonly sessionId: SessionId
}> {}
```

Create `packages/domain/src/assessments/transition.ts`:
```typescript
import type { AssessmentSession, SessionStatus } from "./schema.js"
import { InvalidTransitionError } from "./errors.js"

const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  invited: ["active", "expired"],
  active: ["submitted", "expired"],
  submitted: [],
  expired: [],
}

export function transitionSession(
  session: AssessmentSession,
  targetStatus: SessionStatus,
  timestamp = Date.now()
): AssessmentSession {
  const allowed = VALID_TRANSITIONS[session.status] || []
  if (!allowed.includes(targetStatus)) {
    throw new InvalidTransitionError({
      currentStatus: session.status,
      targetStatus,
    })
  }

  const updates: Partial<AssessmentSession> = { status: targetStatus }
  if (targetStatus === "active" && !session.startedAt) {
    updates.startedAt = timestamp
  }
  if (targetStatus === "submitted") {
    updates.submittedAt = timestamp
  }

  return { ...session, ...updates }
}
```

Create `packages/domain/src/assessments/expiry.ts`:
```typescript
import type { AssessmentSession } from "./schema.js"

export function calculateRemainingSeconds(
  session: AssessmentSession,
  now = Date.now()
): number {
  if (session.status === "submitted" || session.status === "expired") {
    return 0
  }
  if (!session.startedAt) {
    return session.timeLimitMinutes * 60
  }
  const elapsedSeconds = Math.floor((now - session.startedAt) / 1000)
  const totalSeconds = session.timeLimitMinutes * 60
  return Math.max(0, totalSeconds - elapsedSeconds)
}
```

Create `packages/domain/src/assessments/index.ts`:
```typescript
export * from "./schema.js"
export * from "./transition.js"
export * from "./expiry.js"
export * from "./errors.js"
```

Update `packages/domain/src/index.ts`:
```typescript
export * from "./common/index.js"
export * from "./assessments/index.js"
```

- [ ] **Step 4: Run domain tests to verify they pass**

Run: `bun --filter @kuma/domain test`  
Expected: PASS (All tests pass)

---

### Task 3: PostgreSQL Migration & Effect SQL Actions (`packages/infra/src/postgres/`)

**Files:**
- Create: `packages/infra/src/postgres/migrations/0001_assessments.sql`
- Create: `packages/infra/src/postgres/client.ts`
- Create: `packages/infra/src/postgres/errors.ts`
- Create: `packages/infra/src/postgres/actions/assessments/create.ts`
- Create: `packages/infra/src/postgres/actions/assessments/fetch.ts`
- Create: `packages/infra/src/postgres/actions/assessments/list.ts`
- Create: `packages/infra/src/postgres/actions/assessments/update.ts`
- Create: `packages/infra/src/postgres/actions/assessments/index.ts`
- Create: `packages/infra/src/postgres/index.ts`
- Modify: [`packages/infra/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/packages/infra/src/index.ts)
- Test: `packages/infra/test/postgres/assessments.test.ts`

**Interfaces:**
- Consumes: `@kuma/domain`, `@effect/sql`, `@effect/sql-pg`
- Produces:
  - `PgLive`: Layer providing PostgreSQL client
  - `createAssessment(payload)`: `Effect<AssessmentSession, PostgresError>`
  - `fetchAssessment(sessionId)`: `Effect<AssessmentSession, PostgresError | SessionNotFoundError>`
  - `listAssessments()`: `Effect<AssessmentSession[], PostgresError>`
  - `updateAssessment(sessionId, payload)`: `Effect<AssessmentSession, PostgresError | SessionNotFoundError>`

- [ ] **Step 1: Write SQL Migration**

Create `packages/infra/src/postgres/migrations/0001_assessments.sql`:
```sql
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id VARCHAR(64) PRIMARY KEY,
  challenge_id VARCHAR(64) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  language VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'invited',
  active_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at BIGINT,
  submitted_at BIGINT,
  time_limit_minutes INT NOT NULL DEFAULT 45,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
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
import { Config, Effect, Layer } from "effect"
import { PgClient } from "@effect/sql-pg"

export const PgLive = PgClient.layerConfig({
  url: Config.redacted("KUMA_DATABASE_URL").pipe(
    Config.withDefault("postgres://postgres:postgres@localhost:5432/kuma" as any)
  ),
})
```

- [ ] **Step 3: Implement Actions**

Create `packages/infra/src/postgres/actions/assessments/create.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import type { AssessmentSession, CreateAssessmentPayload, SessionId } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const createAssessment = (
  payload: CreateAssessmentPayload,
  sessionId = `sess_${crypto.randomUUID()}` as SessionId
): Effect.Effect<AssessmentSession, PostgresError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      INSERT INTO assessment_sessions (
        id, challenge_id, candidate_name, language, status, active_files, time_limit_minutes
      ) VALUES (
        ${sessionId}, ${payload.challengeId}, ${payload.candidateName},
        ${payload.language}, 'invited', ${JSON.stringify(payload.initialFiles)}, ${payload.timeLimitMinutes}
      )
      RETURNING id, challenge_id as "challengeId", candidate_name as "candidateName",
                language, status, active_files as "activeFiles",
                started_at as "startedAt", submitted_at as "submittedAt",
                time_limit_minutes as "timeLimitMinutes"
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "INSERT INTO assessment_sessions" }))
    )

    const row = rows[0]
    return {
      ...row,
      activeFiles: typeof row.activeFiles === "string" ? JSON.parse(row.activeFiles) : row.activeFiles,
    } as AssessmentSession
  })
```

Create `packages/infra/src/postgres/actions/assessments/fetch.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import { type AssessmentSession, type SessionId, SessionNotFoundError } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const fetchAssessment = (
  sessionId: SessionId
): Effect.Effect<AssessmentSession, PostgresError | SessionNotFoundError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      SELECT id, challenge_id as "challengeId", candidate_name as "candidateName",
             language, status, active_files as "activeFiles",
             started_at as "startedAt", submitted_at as "submittedAt",
             time_limit_minutes as "timeLimitMinutes"
      FROM assessment_sessions
      WHERE id = ${sessionId}
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "SELECT FROM assessment_sessions" }))
    )

    if (rows.length === 0) {
      return yield* new SessionNotFoundError({ sessionId })
    }

    const row = rows[0]
    return {
      ...row,
      activeFiles: typeof row.activeFiles === "string" ? JSON.parse(row.activeFiles) : row.activeFiles,
    } as AssessmentSession
  })
```

Create `packages/infra/src/postgres/actions/assessments/list.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import type { AssessmentSession } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const listAssessments = (): Effect.Effect<AssessmentSession[], PostgresError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const rows = yield* sql<any>`
      SELECT id, challenge_id as "challengeId", candidate_name as "candidateName",
             language, status, active_files as "activeFiles",
             started_at as "startedAt", submitted_at as "submittedAt",
             time_limit_minutes as "timeLimitMinutes"
      FROM assessment_sessions
      ORDER BY created_at DESC
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "LIST assessment_sessions" }))
    )

    return rows.map((row) => ({
      ...row,
      activeFiles: typeof row.activeFiles === "string" ? JSON.parse(row.activeFiles) : row.activeFiles,
    })) as AssessmentSession[]
  })
```

Create `packages/infra/src/postgres/actions/assessments/update.ts`:
```typescript
import { Effect } from "effect"
import { SqlClient } from "@effect/sql"
import { type AssessmentSession, type SessionId, type UpdateAssessmentPayload, SessionNotFoundError } from "@kuma/domain"
import { PostgresError } from "../../errors.js"

export const updateAssessment = (
  sessionId: SessionId,
  payload: UpdateAssessmentPayload
): Effect.Effect<AssessmentSession, PostgresError | SessionNotFoundError, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const current = yield* sql<any>`
      SELECT id, active_files as "activeFiles", status
      FROM assessment_sessions WHERE id = ${sessionId}
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "CHECK assessment_sessions" }))
    )

    if (current.length === 0) {
      return yield* new SessionNotFoundError({ sessionId })
    }

    const nextFiles = payload.activeFiles !== undefined ? JSON.stringify(payload.activeFiles) : current[0].activeFiles
    const nextStatus = payload.status !== undefined ? payload.status : current[0].status

    const rows = yield* sql<any>`
      UPDATE assessment_sessions
      SET active_files = ${nextFiles}::jsonb,
          status = ${nextStatus},
          updated_at = NOW()
      WHERE id = ${sessionId}
      RETURNING id, challenge_id as "challengeId", candidate_name as "candidateName",
                language, status, active_files as "activeFiles",
                started_at as "startedAt", submitted_at as "submittedAt",
                time_limit_minutes as "timeLimitMinutes"
    `.pipe(
      Effect.mapError((cause) => new PostgresError({ cause, query: "UPDATE assessment_sessions" }))
    )

    const row = rows[0]
    return {
      ...row,
      activeFiles: typeof row.activeFiles === "string" ? JSON.parse(row.activeFiles) : row.activeFiles,
    } as AssessmentSession
  })
```

Create `packages/infra/src/postgres/actions/assessments/index.ts`:
```typescript
export * from "./create.js"
export * from "./fetch.js"
export * from "./list.js"
export * from "./update.js"
```

Create `packages/infra/src/postgres/index.ts`:
```typescript
export * from "./client.js"
export * from "./errors.js"
export * from "./actions/assessments/index.js"
```

Update `packages/infra/src/index.ts`:
```typescript
export * from "./postgres/index.js"
```

---

### Task 4: Server Action-Based HTTP Route Handlers (`apps/server/src/api/assessments/`)

**Files:**
- Create: `apps/server/src/config.ts`
- Create: `apps/server/src/api/assessments/create.ts`
- Create: `apps/server/src/api/assessments/fetch.ts`
- Create: `apps/server/src/api/assessments/list.ts`
- Create: `apps/server/src/api/assessments/update.ts`
- Create: `apps/server/src/api/assessments/index.ts`
- Modify: [`apps/server/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/apps/server/src/index.ts)
- Test: `apps/server/test/api/assessments.test.ts`

**Interfaces:**
- Consumes: `@kuma/domain`, `@kuma/infra`, `@effect/platform`
- Produces:
  - `POST /api/v1/assessments` -> 201 Created with `AssessmentSession`
  - `GET /api/v1/assessments/:id` -> 200 OK or 404
  - `GET /api/v1/assessments` -> 200 OK with `AssessmentSession[]`
  - `PATCH /api/v1/assessments/:id` -> 200 OK or 404

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

Create `apps/server/src/api/assessments/create.ts`:
```typescript
import { Effect, Schema } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { SqlClient } from "@effect/sql"
import { CreateAssessmentPayload } from "@kuma/domain"
import { createAssessment } from "@kuma/infra"

export const handleCreateAssessment = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest
  const json = yield* req.json
  const payload = yield* Schema.decodeUnknown(CreateAssessmentPayload)(json)
  const session = yield* createAssessment(payload)
  return yield* HttpServerResponse.json(session, { status: 201 })
})
```

Create `apps/server/src/api/assessments/fetch.ts`:
```typescript
import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "@effect/platform"
import { type SessionId, SessionNotFoundError } from "@kuma/domain"
import { fetchAssessment } from "@kuma/infra"

export const handleFetchAssessment = (sessionId: string) =>
  Effect.gen(function* () {
    const session = yield* fetchAssessment(sessionId as SessionId).pipe(
      Effect.catchTag("SessionNotFoundError", () =>
        HttpServerResponse.json({ error: "Session not found" }, { status: 404 })
      )
    )
    return yield* HttpServerResponse.json(session)
  })
```

Create `apps/server/src/api/assessments/list.ts`:
```typescript
import { Effect } from "effect"
import { HttpServerResponse } from "@effect/platform"
import { listAssessments } from "@kuma/infra"

export const handleListAssessments = Effect.gen(function* () {
  const sessions = yield* listAssessments()
  return yield* HttpServerResponse.json(sessions)
})
```

Create `apps/server/src/api/assessments/update.ts`:
```typescript
import { Effect, Schema } from "effect"
import { HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { type SessionId, UpdateAssessmentPayload } from "@kuma/domain"
import { updateAssessment } from "@kuma/infra"

export const handleUpdateAssessment = (sessionId: string) =>
  Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest
    const json = yield* req.json
    const payload = yield* Schema.decodeUnknown(UpdateAssessmentPayload)(json)
    const session = yield* updateAssessment(sessionId as SessionId, payload).pipe(
      Effect.catchTag("SessionNotFoundError", () =>
        HttpServerResponse.json({ error: "Session not found" }, { status: 404 })
      )
    )
    return yield* HttpServerResponse.json(session)
  })
```

Create `apps/server/src/api/assessments/index.ts`:
```typescript
import { HttpRouter } from "@effect/platform"
import { handleCreateAssessment } from "./create.js"
import { handleFetchAssessment } from "./fetch.js"
import { handleListAssessments } from "./list.js"
import { handleUpdateAssessment } from "./update.js"

export const assessmentsRouter = HttpRouter.empty.pipe(
  HttpRouter.post("/api/v1/assessments", handleCreateAssessment),
  HttpRouter.get("/api/v1/assessments/:id", ({ params }) => handleFetchAssessment(params.id)),
  HttpRouter.get("/api/v1/assessments", handleListAssessments),
  HttpRouter.patch("/api/v1/assessments/:id", ({ params }) => handleUpdateAssessment(params.id))
)
```

Update `apps/server/src/index.ts`:
```typescript
import { Effect, Layer } from "effect"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { createServer } from "node:http"
import { assessmentsRouter } from "./api/assessments/index.js"
import { PgLive } from "@kuma/infra"
import { ServerConfig } from "./config.js"

const ServerLive = NodeHttpServer.layer(() => createServer(), { port: 8080 })

const AppLive = assessmentsRouter.pipe(
  Layer.provide(ServerLive),
  Layer.provide(PgLive)
)

export const runServer = Layer.launch(AppLive)
```

- [ ] **Step 3: Run end-to-end typecheck and linter**

Run: `bun run typecheck && bun run lint`  
Expected: 0 errors across monorepo.
