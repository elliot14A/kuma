# Kuma Coding Standards & Engineering Invariants

These standards and conventions apply to all packages and applications in the Kuma monorepo.

---

## 1. Directory & File Organization Standards

### Invariant 1: Every Directory Has an `index.ts`
- Every directory across `packages/` and `apps/` must expose an `index.ts` barrel acting as the sole public interface for that folder.
- External files import from the folder barrel rather than reaching into deep sub-files.

### Invariant 2: Entity-First Domain Organization
In `packages/domain/src/`, code is grouped strictly by domain entity:
- `assessments/` -> `schema.ts`, `transition.ts`, `expiry.ts`, `errors.ts`, `index.ts`
- `challenges/` -> `schema.ts`, `errors.ts`, `index.ts`
- `executions/` -> `schema.ts`, `errors.ts`, `index.ts`
- `telemetry/` -> `schema.ts`, `scoring.ts`, `anomaly.ts`, `errors.ts`, `index.ts`
- `common/` -> `schema.ts`, `errors.ts`, `index.ts`

### Invariant 3: Action-Based (Verb-Isolated) Infrastructure
In `packages/infra/src/`, services isolate every operation into single-responsibility action files named by verb:
- `postgres/actions/assessments/{create,fetch,list,update}.ts`
- `sandbox/actions/{spawn,execute,terminate}.ts`
- `nebius/actions/{generate,evaluate}.ts`

### Invariant 4: Deep Component Co-Location & Local Hooks in `apps/web`
In `apps/web/src/components/`, every UI component is completely self-contained:
```
components/editor/monacoShell/
├── hooks/
│   ├── useMonacoEditor.ts     # Component-specific hook
│   ├── useEditorShortcuts.ts  # Component-specific keybindings
│   └── index.ts
├── monacoShell.tsx            # Preact Component
├── monacoShell.css.ts         # Vanilla Extract Styles (tokens only)
├── monacoShell.spec.ts        # Playwright Component / UI Test
└── index.ts                   # Public Export
```

### Invariant 5: Global Hooks vs Component Hooks
- **Component-Specific Hooks**: Live in `components/<category>/<componentName>/hooks/`.
- **Global / Shared Hooks**: Live in `apps/web/src/hooks/` (`useAuth.ts`, `useSSEStream.ts`, `useKeyboardShortcut.ts`, `index.ts`).
- **Server Interceptor Hooks**: Live in `apps/server/src/hooks/` (`authHook.ts`, `rateLimitHook.ts`, `telemetryHook.ts`, `index.ts`).

### Invariant 6: Strict Path Aliases
- Monorepo packages: `@kuma/domain`, `@kuma/infra`
- Internal web aliases: `#components/*`, `#hooks/*`, `#state/*`, `#styles/*`, `#mocks/*`
- Never write multi-level relative climbing (`../../../../`).

---

## 2. Testing Conventions (`.test.ts` vs `.spec.ts`)

| Test Type | File Pattern | Test Runner | Purpose | Example |
|---|---|---|---|---|
| **Unit & Integration** | `*.test.ts` | **Vitest** | Domain rules, entity schemas, database action queries, container parsers, API routes | `transition.test.ts`, `execute.test.ts` |
| **Component & E2E** | `*.spec.ts` | **Playwright** | Browser rendering, Monaco editor interactions, ANSI terminal visual tests, arena workflows | `monacoShell.spec.ts`, `arena.spec.ts` |

---

## 3. Strict Effect Engineering Invariants

### Invariant 1: `throw` is FORBIDDEN
- Never use JavaScript `throw`.
- Always fail through Effect's error channel:
  ```typescript
  // ❌ FORBIDDEN
  if (!session) throw new Error("Session not found")

  // ✅ MANDATORY
  if (!session) return yield* new SessionNotFoundError({ sessionId: id })
  ```

### Invariant 2: Dedicated `errors.ts` per Entity / Service
- Every entity and service folder owns a single `errors.ts` defining tagged errors extending `Data.TaggedError`:
  ```typescript
  export class SessionNotFoundError extends Data.TaggedError("SessionNotFoundError")<{
    readonly sessionId: SessionId
  }> {}
  ```

### Invariant 3: Wrap All External I/O with `Effect.try` / `Effect.tryPromise`
- Any third-party promise (Docker API, Node child_process, external fetch) must be safely lifted into Effect:
  ```typescript
  export const spawnProcess = (cmd: string) =>
    Effect.tryPromise({
      try: () => executeCommand(cmd),
      catch: (cause) => new ProcessSpawnError({ cmd, cause }),
    })
  ```

### Invariant 4: No Unsafe Type Casting (`as Type` is FORBIDDEN)
- Always parse and validate untrusted input using `Schema.decodeUnknown`:
  ```typescript
  // ❌ FORBIDDEN: const body = req.body as CreateSessionPayload
  // ✅ MANDATORY: const body = yield* Schema.decodeUnknown(CreateSessionPayload)(req.body)
  ```

### Invariant 5: Resource Cleanup via `acquireRelease` & `Scope`
- Every ephemeral resource (temp directories, container handles) must guarantee cleanup on completion, timeout, or interruption:
  ```typescript
  export const makeTempWorkspace = (files: FileMap) =>
    Effect.acquireRelease(
      createTempDir(files),
      (dir) => removeTempDir(dir).pipe(Effect.orDie)
    )
  ```

---

## 4. Frontend Styling & Token Discipline

1. **Zero Raw Hex Values**:
   - Strictly consume colors, spacing, and radii from [`apps/web/src/styles/tokens.ts`](file:///home/kiwi/Desktop/hackathons/kuma/apps/web/src/styles/tokens.ts).
2. **Zero Inline Styles in JSX**:
   - All visual styling belongs in co-located `*.css.ts` files using `@vanilla-extract/css`.
3. **Reactive State with `@effect-atom/atom`**:
   - Manage UI state using Effect Atoms (`Atom.make`, `useAtom`, `useAtomValue`).
