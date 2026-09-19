# Milestone 1: Candidate Workspace Shell & Entity-First Domain Schemas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete interactive Candidate Workspace UI in `apps/web` (Monaco editor, multi-file tabs, markdown problem viewer, ANSI terminal console) powered by type-safe Effect v4 entity-first domain schemas and standalone mock execution fixtures.

**Architecture:** 
- `packages/domain` defines branded Effect v4 schemas (`Challenge`, `AssessmentSession`, `ExecutionRun`, `FileMap`) grouped by entity (`challenges/`, `assessments/`, `executions/`, `telemetry/`) with dedicated `errors.ts` and `index.ts` barrels.
- `apps/web` consumes `@kuma/domain` and implements a reactive split-pane IDE using Preact, Monaco Editor, Vanilla Extract styling tokens, and co-located components (`component.tsx` + `component.css.ts` + `index.ts`).

**Tech Stack:** Effect v4 (`4.0.0-rc.115`), Preact, `@monaco-editor/react`, `@vanilla-extract/css`, `ansi-to-react`, `react-markdown`, `vitest`.

**Spec:** [`WORKFLOW.md`](file:///home/kiwi/Desktop/hackathons/kuma/WORKFLOW.md), [`docs/ARCHITECTURE.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/ARCHITECTURE.md), [`docs/CODING_STANDARDS.md`](file:///home/kiwi/Desktop/hackathons/kuma/docs/CODING_STANDARDS.md)

## Global Constraints
- Strictly consume design tokens from [`apps/web/src/styles/tokens.ts`](file:///home/kiwi/Desktop/hackathons/kuma/apps/web/src/styles/tokens.ts) — zero raw hex codes or inline styles.
- Strict `KUMA_` prefix for all environment variables.
- Effect v4 import conventions (`import { Schema, Data } from "effect"`).
- `throw` is FORBIDDEN — always fail through typed Effect channels with `Data.TaggedError`.
- Every directory must have an `index.ts` barrel.
- Dual-runtime support (TypeScript + Python) from day one.
- No slop comments; preserve clean, idiomatic TypeScript.

---

### Task 1: Setup Vitest Test Harness Across Monorepo

**Files:**
- Modify: [`packages/domain/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/package.json)
- Modify: [`apps/web/package.json`](file:///home/kiwi/Desktop/hackathons/kuma/apps/web/package.json)
- Modify: [`package.json`](file:///home/kiwi/Desktop/hackathons/kuma/package.json)
- Modify: [`Justfile`](file:///home/kiwi/Desktop/hackathons/kuma/Justfile)

**Interfaces:**
- Consumes: None
- Produces: `bun test` / `just test` executable across workspace packages.

- [ ] **Step 1: Update package.json scripts and add vitest**

Add `"test": "vitest run"` in root `package.json`, `packages/domain/package.json`, and `apps/web/package.json`.

- [ ] **Step 2: Add test recipe to Justfile**

```justfile
test:
    bun x vitest run
```

- [ ] **Step 3: Verify test runner works**

Run: `bun x vitest --version`  
Expected: `vitest/5.x.x`

---

### Task 2: Entity-First Domain Schemas & Branded Types

**Files:**
- Create: `packages/domain/src/common/schema.ts`
- Create: `packages/domain/src/common/errors.ts`
- Create: `packages/domain/src/common/index.ts`
- Create: `packages/domain/src/challenges/schema.ts`
- Create: `packages/domain/src/challenges/errors.ts`
- Create: `packages/domain/src/challenges/index.ts`
- Create: `packages/domain/src/assessments/schema.ts`
- Create: `packages/domain/src/assessments/transition.ts`
- Create: `packages/domain/src/assessments/errors.ts`
- Create: `packages/domain/src/assessments/index.ts`
- Create: `packages/domain/src/executions/schema.ts`
- Create: `packages/domain/src/executions/errors.ts`
- Create: `packages/domain/src/executions/index.ts`
- Create: `packages/domain/src/telemetry/schema.ts`
- Create: `packages/domain/src/telemetry/errors.ts`
- Create: `packages/domain/src/telemetry/index.ts`
- Modify: [`packages/domain/src/index.ts`](file:///home/kiwi/Desktop/hackathons/kuma/packages/domain/src/index.ts)
- Test: `packages/domain/test/domain.test.ts`

**Interfaces:**
- Consumes: `effect` (`Schema`, `Data`)
- Produces:
  - `LanguageRuntime`: `"typescript" | "python"`
  - Branded types: `ChallengeId`, `SessionId`, `ExecutionRunId`
  - Entity schemas: `Challenge`, `AssessmentSession`, `ExecutionChunk`, `TestCaseResult`, `ExecutionSummary`, `TelemetryEvent`
  - Transition rule: `transitionSession(session, nextStatus)`

- [ ] **Step 1: Write failing domain tests**

Create `packages/domain/test/domain.test.ts`:
```typescript
import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  Challenge,
  AssessmentSession,
  transitionSession,
  InvalidTransitionError,
} from "../src/index.js"

describe("Entity-First Domain Models", () => {
  it("decodes a valid TypeScript Challenge", () => {
    const raw = {
      id: "ch_ts_1",
      title: "Fix Token Bucket Limiter",
      description: "Fix the leaky bucket algorithm.",
      language: "typescript",
      starterFiles: { "src/limiter.ts": "export class RateLimiter {}" },
      testFiles: { "test/limiter.test.ts": "import { describe } from 'vitest'" },
      timeLimitMinutes: 45,
    }
    const decoded = Schema.decodeSync(Challenge)(raw)
    expect(decoded.language).toBe("typescript")
    expect(decoded.starterFiles["src/limiter.ts"]).toBeDefined()
  })

  it("decodes a valid Python Challenge", () => {
    const raw = {
      id: "ch_py_1",
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

  it("applies valid session state transition", () => {
    const session: AssessmentSession = {
      id: "sess_1" as any,
      challengeId: "ch_ts_1" as any,
      candidateName: "Alex",
      language: "typescript",
      status: "active",
      activeFiles: {},
      remainingSeconds: 1800,
    }
    const updated = transitionSession(session, "submitted")
    expect(updated.status).toBe("submitted")
  })

  it("fails on invalid session transition", () => {
    const session: AssessmentSession = {
      id: "sess_1" as any,
      challengeId: "ch_ts_1" as any,
      candidateName: "Alex",
      language: "typescript",
      status: "submitted",
      activeFiles: {},
      remainingSeconds: 0,
    }
    expect(() => transitionSession(session, "active")).toThrowError()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @kuma/domain test`  
Expected: FAIL

- [ ] **Step 3: Implement domain entity modules**

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
  readonly details?: unknown
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
```

Create `packages/domain/src/challenges/errors.ts`:
```typescript
import { Data } from "effect"
import type { ChallengeId } from "./schema.js"

export class ChallengeNotFoundError extends Data.TaggedError("ChallengeNotFoundError")<{
  readonly challengeId: ChallengeId
}> {}
```

Create `packages/domain/src/challenges/index.ts`:
```typescript
export * from "./schema.js"
export * from "./errors.js"
```

Create `packages/domain/src/assessments/schema.ts`:
```typescript
import { Schema } from "effect"
import { FileMap, LanguageRuntime } from "../common/schema.js"
import { ChallengeId } from "../challenges/schema.js"

export const SessionId = Schema.String.pipe(Schema.brand("SessionId"))
export type SessionId = typeof SessionId.Type

export const SessionStatus = Schema.Literal("invited", "active", "submitted", "expired")
export type SessionStatus = typeof SessionStatus.Type

export const AssessmentSession = Schema.Struct({
  id: SessionId,
  challengeId: ChallengeId,
  candidateName: Schema.String,
  language: LanguageRuntime,
  status: SessionStatus,
  activeFiles: FileMap,
  remainingSeconds: Schema.Number,
})
export type AssessmentSession = typeof AssessmentSession.Type
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
  targetStatus: SessionStatus
): AssessmentSession {
  const allowed = VALID_TRANSITIONS[session.status] || []
  if (!allowed.includes(targetStatus)) {
    throw new InvalidTransitionError({
      currentStatus: session.status,
      targetStatus,
    })
  }
  return { ...session, status: targetStatus }
}
```

Create `packages/domain/src/assessments/index.ts`:
```typescript
export * from "./schema.js"
export * from "./transition.js"
export * from "./errors.js"
```

Create `packages/domain/src/executions/schema.ts`:
```typescript
import { Schema } from "effect"

export const ExecutionRunId = Schema.String.pipe(Schema.brand("ExecutionRunId"))
export type ExecutionRunId = typeof ExecutionRunId.Type

export const ExecutionStatus = Schema.Literal("idle", "running", "passed", "failed", "timeout", "error")
export type ExecutionStatus = typeof ExecutionStatus.Type

export const ExecutionChunk = Schema.Struct({
  runId: ExecutionRunId,
  type: Schema.Literal("stdout", "stderr", "status"),
  data: Schema.String,
  timestamp: Schema.Number,
})
export type ExecutionChunk = typeof ExecutionChunk.Type

export const TestCaseResult = Schema.Struct({
  name: Schema.String,
  status: Schema.Literal("passed", "failed"),
  durationMs: Schema.Number,
  errorMessage: Schema.optional(Schema.String),
  expected: Schema.optional(Schema.String),
  actual: Schema.optional(Schema.String),
})
export type TestCaseResult = typeof TestCaseResult.Type

export const ExecutionSummary = Schema.Struct({
  runId: ExecutionRunId,
  status: ExecutionStatus,
  totalTests: Schema.Number,
  passedTests: Schema.Number,
  failedTests: Schema.Number,
  durationMs: Schema.Number,
  testResults: Schema.Array(TestCaseResult),
})
export type ExecutionSummary = typeof ExecutionSummary.Type
```

Create `packages/domain/src/executions/errors.ts`:
```typescript
import { Data } from "effect"
import type { ExecutionRunId } from "./schema.js"

export class ExecutionFailedError extends Data.TaggedError("ExecutionFailedError")<{
  readonly runId: ExecutionRunId
  readonly exitCode: number
  readonly output: string
}> {}
```

Create `packages/domain/src/executions/index.ts`:
```typescript
export * from "./schema.js"
export * from "./errors.js"
```

Create `packages/domain/src/telemetry/schema.ts`:
```typescript
import { Schema } from "effect"
import { SessionId } from "../assessments/schema.js"

export const TelemetryEventType = Schema.Literal(
  "keystroke_delta",
  "paste_dump",
  "window_blur",
  "window_focus",
  "tab_switch",
  "copilot_prompt"
)
export type TelemetryEventType = typeof TelemetryEventType.Type

export const TelemetryEvent = Schema.Struct({
  sessionId: SessionId,
  type: TelemetryEventType,
  timestamp: Schema.Number,
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
})
export type TelemetryEvent = typeof TelemetryEvent.Type
```

Create `packages/domain/src/telemetry/errors.ts`:
```typescript
import { Data } from "effect"

export class TelemetryParseError extends Data.TaggedError("TelemetryParseError")<{
  readonly cause: unknown
}> {}
```

Create `packages/domain/src/telemetry/index.ts`:
```typescript
export * from "./schema.js"
export * from "./errors.js"
```

Update `packages/domain/src/index.ts`:
```typescript
export * from "./common/index.js"
export * from "./challenges/index.js"
export * from "./assessments/index.js"
export * from "./executions/index.js"
export * from "./telemetry/index.js"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun --filter @kuma/domain test`  
Expected: PASS

---

### Task 3: Standalone Mock Fixtures & Workspace Store (`apps/web`)

**Files:**
- Create: `apps/web/src/mocks/fixtures.ts`
- Create: `apps/web/src/mocks/index.ts`
- Create: `apps/web/src/state/workspaceStore.ts`
- Create: `apps/web/src/state/index.ts`
- Test: `apps/web/test/workspaceStore.test.ts`

- [ ] **Step 1: Write failing store test**

Create `apps/web/test/workspaceStore.test.ts`:
```typescript
import { describe, expect, it } from "vitest"
import { createWorkspaceStore } from "../src/state/workspaceStore.js"
import { MOCK_CHALLENGE_TS } from "../src/mocks/fixtures.js"

describe("Workspace Store", () => {
  it("initializes with starter files and sets active file", () => {
    const store = createWorkspaceStore(MOCK_CHALLENGE_TS)
    expect(store.getState().activeFilePath).toBe("src/limiter.ts")
    expect(store.getState().openFiles).toContain("src/limiter.ts")
  })

  it("updates file content on edit", () => {
    const store = createWorkspaceStore(MOCK_CHALLENGE_TS)
    store.updateFileContent("src/limiter.ts", "export const test = 123")
    expect(store.getState().files["src/limiter.ts"]).toBe("export const test = 123")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun --filter @kuma/web test`  
Expected: FAIL

- [ ] **Step 3: Implement mock fixtures and workspace store**

Create `apps/web/src/mocks/fixtures.ts`:
```typescript
import type { Challenge } from "@kuma/domain"

export const MOCK_CHALLENGE_TS: Challenge = {
  id: "ch_ts_token_bucket" as any,
  title: "Debug Token Bucket Rate Limiter",
  description: `## Problem Statement
You are given a TypeScript token bucket rate limiter implementation in \`src/limiter.ts\`.

### The Bug
Under concurrent burst traffic, tokens leak due to an unhandled floating point rounding error when refilling tokens.

### Requirements
1. Fix \`refill()\` calculation so fractional tokens accumulate correctly.
2. Ensure \`tryConsume(count)\` returns \`true\` if and only if sufficient tokens exist.
3. Pass all unit tests in \`test/limiter.test.ts\`.
`,
  language: "typescript",
  starterFiles: {
    "src/limiter.ts": `export interface RateLimiterOptions {
  capacity: number
  refillRatePerSecond: number
}

export class TokenBucketRateLimiter {
  private tokens: number
  private lastRefillTimestamp: number
  private readonly capacity: number
  private readonly refillRatePerSecond: number

  constructor(options: RateLimiterOptions) {
    this.capacity = options.capacity
    this.refillRatePerSecond = options.refillRatePerSecond
    this.tokens = options.capacity
    this.lastRefillTimestamp = Date.now()
  }

  public tryConsume(tokens = 1): boolean {
    this.refill()
    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }
    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRatePerSecond)
    this.lastRefillTimestamp = now
  }
}
`,
    "package.json": `{\n  "name": "rate-limiter-challenge",\n  "type": "module"\n}`,
  },
  testFiles: {
    "test/limiter.test.ts": `import { describe, expect, it } from "vitest"
import { TokenBucketRateLimiter } from "../src/limiter.js"

describe("TokenBucketRateLimiter", () => {
  it("consumes available tokens within capacity", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 5, refillRatePerSecond: 1 })
    expect(limiter.tryConsume(3)).toBe(true)
    expect(limiter.tryConsume(3)).toBe(false)
  })
})`,
  },
  timeLimitMinutes: 45,
}

export const MOCK_CHALLENGE_PY: Challenge = {
  id: "ch_py_lru_ttl" as any,
  title: "Implement Async Cache with TTL",
  description: `## Problem Statement
Implement an asynchronous TTL (Time-To-Live) cache in Python with automated background expiration cleanup.
`,
  language: "python",
  starterFiles: {
    "cache.py": `import time
from typing import Any, Optional, Dict, Tuple

class TTLCache:
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}

    def set(self, key: str, value: Any, ttl_seconds: float) -> None:
        expiry = time.time() + ttl_seconds
        self._store[key] = (value, expiry)

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        val, expiry = self._store[key]
        if time.time() > expiry:
            del self._store[key]
            return None
        return val
`,
  },
  testFiles: {
    "test_cache.py": `import time
from cache import TTLCache

def test_cache_ttl_expiry():
    cache = TTLCache()
    cache.set("foo", "bar", 0.1)
    assert cache.get("foo") == "bar"
`,
  },
  timeLimitMinutes: 30,
}
```

Create `apps/web/src/mocks/index.ts`:
```typescript
export * from "./fixtures.js"
```

Create `apps/web/src/state/workspaceStore.ts`:
```typescript
import type { Challenge, ExecutionStatus, LanguageRuntime } from "@kuma/domain"

export interface WorkspaceState {
  challenge: Challenge
  language: LanguageRuntime
  files: Record<string, string>
  activeFilePath: string
  openFiles: string[]
  executionStatus: ExecutionStatus
  terminalOutput: string[]
  remainingSeconds: number
}

export interface WorkspaceStore {
  getState: () => WorkspaceState
  subscribe: (listener: (state: WorkspaceState) => void) => () => void
  setActiveFile: (filePath: string) => void
  openFile: (filePath: string) => void
  closeFile: (filePath: string) => void
  updateFileContent: (filePath: string, content: string) => void
  setExecutionStatus: (status: ExecutionStatus) => void
  appendTerminalOutput: (chunk: string) => void
  setLanguage: (lang: LanguageRuntime) => void
}

export function createWorkspaceStore(initialChallenge: Challenge): WorkspaceStore {
  const starterFileKeys = Object.keys(initialChallenge.starterFiles)
  const initialActive = starterFileKeys[0] || "index.ts"

  let state: WorkspaceState = {
    challenge: initialChallenge,
    language: initialChallenge.language,
    files: { ...initialChallenge.starterFiles },
    activeFilePath: initialActive,
    openFiles: starterFileKeys.slice(0, 3),
    executionStatus: "idle",
    terminalOutput: [
      "\x1b[36m[kuma-runner]\x1b[0m Workspace initialized. Ready to execute.",
    ],
    remainingSeconds: initialChallenge.timeLimitMinutes * 60,
  }

  const listeners = new Set<(state: WorkspaceState) => void>()
  const notify = () => listeners.forEach((fn) => fn(state))

  return {
    getState: () => state,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    setActiveFile: (filePath) => {
      if (state.files[filePath] !== undefined) {
        state = {
          ...state,
          activeFilePath: filePath,
          openFiles: state.openFiles.includes(filePath)
            ? state.openFiles
            : [...state.openFiles, filePath],
        }
        notify()
      }
    },
    openFile: (filePath) => {
      if (state.files[filePath] !== undefined && !state.openFiles.includes(filePath)) {
        state = { ...state, openFiles: [...state.openFiles, filePath], activeFilePath: filePath }
        notify()
      }
    },
    closeFile: (filePath) => {
      const nextOpen = state.openFiles.filter((f) => f !== filePath)
      let nextActive = state.activeFilePath
      if (state.activeFilePath === filePath) {
        nextActive = nextOpen[0] || ""
      }
      state = { ...state, openFiles: nextOpen, activeFilePath: nextActive }
      notify()
    },
    updateFileContent: (filePath, content) => {
      state = {
        ...state,
        files: { ...state.files, [filePath]: content },
      }
      notify()
    },
    setExecutionStatus: (status) => {
      state = { ...state, executionStatus: status }
      notify()
    },
    appendTerminalOutput: (chunk) => {
      state = {
        ...state,
        terminalOutput: [...state.terminalOutput, chunk],
      }
      notify()
    },
    setLanguage: (lang) => {
      state = { ...state, language: lang }
      notify()
    },
  }
}
```

Create `apps/web/src/state/index.ts`:
```typescript
export * from "./workspaceStore.js"
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun --filter @kuma/web test`  
Expected: PASS

---

### Task 4: Co-Located SplitPane & ProblemViewer Components

**Files:**
- Create: `apps/web/src/components/layout/splitPane/splitPane.tsx`
- Create: `apps/web/src/components/layout/splitPane/splitPane.css.ts`
- Create: `apps/web/src/components/layout/splitPane/index.ts`
- Create: `apps/web/src/components/problem/problemViewer/problemViewer.tsx`
- Create: `apps/web/src/components/problem/problemViewer/problemViewer.css.ts`
- Create: `apps/web/src/components/problem/problemViewer/index.ts`

- [ ] **Step 1: Implement SplitPane**

Create `apps/web/src/components/layout/splitPane/splitPane.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors } from "#/styles/tokens.js"

export const container = style({
  display: "flex",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  backgroundColor: colors.background,
})

export const leftPane = style({
  height: "100%",
  overflow: "auto",
  borderRight: `1px solid ${colors.border}`,
})

export const rightPane = style({
  flex: 1,
  height: "100%",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
})

export const divider = style({
  width: "4px",
  cursor: "col-resize",
  backgroundColor: "transparent",
  ":hover": {
    backgroundColor: colors.primary,
  },
})
```

Create `apps/web/src/components/layout/splitPane/splitPane.tsx`:
```tsx
import { h, type ComponentChildren } from "preact"
import { useState } from "preact/hooks"
import * as styles from "./splitPane.css.js"

export interface SplitPaneProps {
  left: ComponentChildren
  right: ComponentChildren
  defaultRatio?: number
}

export function SplitPane({ left, right, defaultRatio = 0.38 }: SplitPaneProps) {
  const [ratio] = useState(defaultRatio)

  return (
    <div className={styles.container}>
      <div className={styles.leftPane} style={{ width: `${ratio * 100}%` }}>
        {left}
      </div>
      <div className={styles.divider} />
      <div className={styles.rightPane}>
        {right}
      </div>
    </div>
  )
}
```

Create `apps/web/src/components/layout/splitPane/index.ts`:
```typescript
export * from "./splitPane.js"
```

- [ ] **Step 2: Implement ProblemViewer**

Create `apps/web/src/components/problem/problemViewer/problemViewer.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors, fontSizes, fonts, radii, space } from "#/styles/tokens.js"

export const container = style({
  padding: space.xl,
  fontFamily: fonts.sans,
  color: colors.textPrimary,
  lineHeight: 1.6,
})

export const title = style({
  fontSize: fontSizes["2xl"],
  fontWeight: 700,
  marginBottom: space.sm,
  color: colors.textInverse,
})

export const badge = style({
  display: "inline-block",
  padding: `${space["2xs"]} ${space.sm}`,
  borderRadius: radii.sm,
  fontSize: fontSizes.xs,
  fontFamily: fonts.mono,
  textTransform: "uppercase",
  backgroundColor: colors.primaryMuted,
  color: colors.primary,
  border: `1px solid ${colors.primaryBorder}`,
  marginBottom: space.md,
})

export const markdown = style({
  fontSize: fontSizes.base,
  color: colors.textSecondary,
  "& h2": {
    color: colors.textPrimary,
    fontSize: fontSizes.lg,
    marginTop: space.lg,
    marginBottom: space.xs,
  },
  "& code": {
    fontFamily: fonts.mono,
    backgroundColor: colors.surfaceElevated,
    padding: `${space["3xs"]} ${space.xs}`,
    borderRadius: radii.xs,
    color: colors.teal,
  },
})
```

Create `apps/web/src/components/problem/problemViewer/problemViewer.tsx`:
```tsx
import { h } from "preact"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import * as styles from "./problemViewer.css.js"

export interface ProblemViewerProps {
  title: string
  description: string
  language: string
}

export function ProblemViewer({ title, description, language }: ProblemViewerProps) {
  return (
    <div className={styles.container}>
      <span className={styles.badge}>{language}</span>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.markdown}>
        <Markdown remarkPlugins={[remarkGfm]}>{description}</Markdown>
      </div>
    </div>
  )
}
```

Create `apps/web/src/components/problem/problemViewer/index.ts`:
```typescript
export * from "./problemViewer.js"
```

---

### Task 5: Co-Located TabBar & MonacoShell Components

**Files:**
- Create: `apps/web/src/components/editor/tabBar/tabBar.tsx`
- Create: `apps/web/src/components/editor/tabBar/tabBar.css.ts`
- Create: `apps/web/src/components/editor/tabBar/index.ts`
- Create: `apps/web/src/components/editor/monacoShell/monacoShell.tsx`
- Create: `apps/web/src/components/editor/monacoShell/monacoShell.css.ts`
- Create: `apps/web/src/components/editor/monacoShell/index.ts`

- [ ] **Step 1: Implement TabBar**

Create `apps/web/src/components/editor/tabBar/tabBar.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors, fontSizes, fonts, radii, space } from "#/styles/tokens.js"

export const container = style({
  display: "flex",
  alignItems: "center",
  backgroundColor: colors.surface,
  borderBottom: `1px solid ${colors.border}`,
  overflowX: "auto",
  height: "36px",
  paddingLeft: space.xs,
})

export const tab = style({
  display: "flex",
  alignItems: "center",
  gap: space.xs,
  padding: `0 ${space.md}`,
  height: "100%",
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  color: colors.textSecondary,
  backgroundColor: "transparent",
  border: "none",
  borderRight: `1px solid ${colors.borderSubtle}`,
  cursor: "pointer",
  ":hover": {
    color: colors.textPrimary,
    backgroundColor: colors.surfaceHover,
  },
})

export const activeTab = style({
  color: colors.textInverse,
  backgroundColor: colors.surfaceElevated,
  borderBottom: `2px solid ${colors.primary}`,
})

export const closeBtn = style({
  marginLeft: space.xs,
  color: colors.textTertiary,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  borderRadius: radii.xs,
  padding: "2px",
  ":hover": {
    color: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
})
```

Create `apps/web/src/components/editor/tabBar/tabBar.tsx`:
```tsx
import { h } from "preact"
import * as styles from "./tabBar.css.js"

export interface TabBarProps {
  openFiles: string[]
  activeFile: string
  onSelectFile: (file: string) => void
  onCloseFile: (file: string) => void
}

export function TabBar({ openFiles, activeFile, onSelectFile, onCloseFile }: TabBarProps) {
  return (
    <div className={styles.container}>
      {openFiles.map((file) => {
        const isActive = file === activeFile
        return (
          <div
            key={file}
            className={`${styles.tab} ${isActive ? styles.activeTab : ""}`}
            onClick={() => onSelectFile(file)}
          >
            <span>{file}</span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={(e) => {
                e.stopPropagation()
                onCloseFile(file)
              }}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
```

Create `apps/web/src/components/editor/tabBar/index.ts`:
```typescript
export * from "./tabBar.js"
```

- [ ] **Step 2: Implement MonacoShell**

Create `apps/web/src/components/editor/monacoShell/monacoShell.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors } from "#/styles/tokens.js"

export const container = style({
  flex: 1,
  width: "100%",
  height: "100%",
  backgroundColor: colors.background,
  overflow: "hidden",
})
```

Create `apps/web/src/components/editor/monacoShell/monacoShell.tsx`:
```tsx
import { h } from "preact"
import Editor from "@monaco-editor/react"
import * as styles from "./monacoShell.css.js"

export interface MonacoShellProps {
  language: "typescript" | "python"
  value: string
  onChange: (value: string) => void
}

export function MonacoShell({ language, value, onChange }: MonacoShellProps) {
  return (
    <div className={styles.container}>
      <Editor
        height="100%"
        theme="vs-dark"
        language={language === "typescript" ? "typescript" : "python"}
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          fontSize: 13,
          fontFamily: '"Geist Mono", monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12 },
        }}
      />
    </div>
  )
}
```

Create `apps/web/src/components/editor/monacoShell/index.ts`:
```typescript
export * from "./monacoShell.js"
```

---

### Task 6: Terminal & StatusBar with Arena Assembly (`apps/web/src/main.tsx`)

**Files:**
- Create: `apps/web/src/components/terminal/terminalView/terminalView.tsx`
- Create: `apps/web/src/components/terminal/terminalView/terminalView.css.ts`
- Create: `apps/web/src/components/terminal/terminalView/index.ts`
- Create: `apps/web/src/components/terminal/statusBar/statusBar.tsx`
- Create: `apps/web/src/components/terminal/statusBar/statusBar.css.ts`
- Create: `apps/web/src/components/terminal/statusBar/index.ts`
- Modify: [`apps/web/src/main.tsx`](file:///home/kiwi/Desktop/hackathons/kuma/apps/web/src/main.tsx)

- [ ] **Step 1: Implement TerminalView & StatusBar**

Create `apps/web/src/components/terminal/terminalView/terminalView.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors, fontSizes, fonts, space } from "#/styles/tokens.js"

export const container = style({
  height: "180px",
  backgroundColor: colors.surface,
  borderTop: `1px solid ${colors.border}`,
  padding: space.sm,
  overflowY: "auto",
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  color: colors.textPrimary,
  whiteSpace: "pre-wrap",
})
```

Create `apps/web/src/components/terminal/terminalView/terminalView.tsx`:
```tsx
import { h } from "preact"
import Ansi from "ansi-to-react"
import * as styles from "./terminalView.css.js"

export interface TerminalViewProps {
  lines: string[]
}

export function TerminalView({ lines }: TerminalViewProps) {
  return (
    <div className={styles.container}>
      {lines.map((line, idx) => (
        <div key={idx}>
          <Ansi>{line}</Ansi>
        </div>
      ))}
    </div>
  )
}
```

Create `apps/web/src/components/terminal/terminalView/index.ts`:
```typescript
export * from "./terminalView.js"
```

Create `apps/web/src/components/terminal/statusBar/statusBar.css.ts`:
```typescript
import { style } from "@vanilla-extract/css"
import { colors, fontSizes, fonts, radii, space } from "#/styles/tokens.js"

export const bar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${space.xs} ${space.md}`,
  backgroundColor: colors.surfaceElevated,
  borderTop: `1px solid ${colors.border}`,
  fontFamily: fonts.sans,
  fontSize: fontSizes.xs,
})

export const left = style({
  display: "flex",
  alignItems: "center",
  gap: space.md,
})

export const runBtn = style({
  backgroundColor: colors.primary,
  color: colors.textInverse,
  border: "none",
  borderRadius: radii.sm,
  padding: `${space.xs} ${space.md}`,
  fontWeight: 600,
  fontFamily: fonts.sans,
  fontSize: fontSizes.xs,
  cursor: "pointer",
  ":hover": {
    backgroundColor: colors.primaryHover,
  },
})

export const timer = style({
  fontFamily: fonts.mono,
  color: colors.textSecondary,
})
```

Create `apps/web/src/components/terminal/statusBar/statusBar.tsx`:
```tsx
import { h } from "preact"
import type { ExecutionStatus } from "@kuma/domain"
import * as styles from "./statusBar.css.js"

export interface StatusBarProps {
  status: ExecutionStatus
  remainingSeconds: number
  onRunTests: () => void
}

export function StatusBar({ status, remainingSeconds, onRunTests }: StatusBarProps) {
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <button type="button" className={styles.runBtn} onClick={onRunTests}>
          ▶ Run Tests (Cmd+Enter)
        </button>
        <span>Status: <strong>{status}</strong></span>
      </div>
      <div className={styles.timer}>
        ⏳ Time Remaining: {timeFormatted}
      </div>
    </div>
  )
}
```

Create `apps/web/src/components/terminal/statusBar/index.ts`:
```typescript
export * from "./statusBar.js"
```

- [ ] **Step 2: Assemble Complete Arena in main.tsx**

Update `apps/web/src/main.tsx`:
```tsx
import { h, render } from "preact"
import { useState, useEffect } from "preact/hooks"
import "#/styles/index.js"
import { createWorkspaceStore } from "#/state/index.js"
import { MOCK_CHALLENGE_TS, MOCK_CHALLENGE_PY } from "#/mocks/index.js"
import { SplitPane } from "#/components/layout/splitPane/index.js"
import { ProblemViewer } from "#/components/problem/problemViewer/index.js"
import { TabBar } from "#/components/editor/tabBar/index.js"
import { MonacoShell } from "#/components/editor/monacoShell/index.js"
import { TerminalView } from "#/components/terminal/terminalView/index.js"
import { StatusBar } from "#/components/terminal/statusBar/index.js"

const store = createWorkspaceStore(MOCK_CHALLENGE_TS)

function App() {
  const [state, setState] = useState(store.getState())

  useEffect(() => {
    return store.subscribe(setState)
  }, [])

  const handleRunTests = () => {
    store.setExecutionStatus("running")
    store.appendTerminalOutput(`\x1b[33m[kuma-runner]\x1b[0m Executing ${state.language} test suite...`)
    setTimeout(() => {
      store.appendTerminalOutput("\x1b[32m✓ test/limiter.test.ts > consumes available tokens within capacity\x1b[0m")
      store.appendTerminalOutput("\x1b[32mTest Files 1 passed (1)\x1b[0m")
      store.setExecutionStatus("passed")
    }, 800)
  }

  const currentContent = state.files[state.activeFilePath] || ""

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ height: "40px", backgroundColor: "#111114", borderBottom: "1px solid #212227", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <strong style={{ color: "#EDEDEF", fontFamily: "sans-serif" }}>熊 Kuma Arena</strong>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            style={{ background: state.language === "typescript" ? "#5E6AD2" : "#1E1F24", color: "#FFF", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
            onClick={() => {
              const newStore = createWorkspaceStore(MOCK_CHALLENGE_TS)
              setState(newStore.getState())
            }}
          >
            TypeScript
          </button>
          <button
            type="button"
            style={{ background: state.language === "python" ? "#5E6AD2" : "#1E1F24", color: "#FFF", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
            onClick={() => {
              const newStore = createWorkspaceStore(MOCK_CHALLENGE_PY)
              setState(newStore.getState())
            }}
          >
            Python
          </button>
        </div>
      </header>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <SplitPane
          left={
            <ProblemViewer
              title={state.challenge.title}
              description={state.challenge.description}
              language={state.language}
            />
          }
          right={
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <TabBar
                openFiles={state.openFiles}
                activeFile={state.activeFilePath}
                onSelectFile={(f) => store.setActiveFile(f)}
                onCloseFile={(f) => store.closeFile(f)}
              />
              <MonacoShell
                language={state.language}
                value={currentContent}
                onChange={(val) => store.updateFileContent(state.activeFilePath, val)}
              />
              <TerminalView lines={state.terminalOutput} />
              <StatusBar
                status={state.executionStatus}
                remainingSeconds={state.remainingSeconds}
                onRunTests={handleRunTests}
              />
            </div>
          }
        />
      </div>
    </div>
  )
}

const root = document.getElementById("root")
if (root) {
  render(<App />, root)
}
```

- [ ] **Step 3: Verify TypeScript typechecks and tests pass**

Run: `bun run typecheck && bun run lint`  
Expected: 0 errors across all packages.
