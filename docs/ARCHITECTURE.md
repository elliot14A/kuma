# Kuma (熊) Architecture & System Design

**Kuma** is an autonomous real-world technical assessment platform built for the **Nebius x NVIDIA Global AI Hackathon (Coding & Agentic Engineering Track)**.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Frontend_App ["🎨 Frontend: Candidate Arena & Manager UI (apps/web)"]
        UI_Workspace["Multi-File Monaco Workspace (components/editor/monacoShell)"]
        UI_Terminal["ANSI Streaming Console (components/terminal/terminalView)"]
        UI_TestDrawer["Structured Test Drawer (components/terminal/statusBar)"]
        UI_Hooks["Component Hooks (component/hooks/) & Global Hooks (src/hooks/)"]
        UI_Atoms["Effect Atoms (state/workspaceStore.ts)"]
    end

    subgraph Backend_App ["⚙️ Backend: API Gateway & Handlers (apps/server)"]
        HTTP_Handlers["Action-Based HTTP Handlers (/api/assessments, /api/executions)"]
        Server_Hooks["Server Hooks & Middleware (hooks/authHook, rateLimitHook)"]
        SSE_Broadcaster["Live SSE Streaming Controller (sse/executionHub)"]
        Server_Config["Server Config (KUMA_ prefix)"]
        Layer_Assembly["Effect Layer Assembly (main.ts)"]
    end

    subgraph Domain_Layer ["📦 Pure Domain Layer (packages/domain)"]
        Entity_Assessments["assessments/ (schema, transition, expiry, errors)"]
        Entity_Challenges["challenges/ (schema, errors)"]
        Entity_Executions["executions/ (schema, errors)"]
        Entity_Telemetry["telemetry/ (schema, scoring, anomaly, errors)"]
    end

    subgraph Infra_Layer ["🛡️ Infrastructure & Services (packages/infra)"]
        Postgres_Service["postgres/ (actions, client, errors)"]
        Sandbox_Service["sandbox/ (actions, parsers, hooks, errors)"]
        Nebius_Service["nebius/ (actions, prompts, errors)"]
    end

    Frontend_App <-->|REST & Live SSE Stream| Backend_App
    Backend_App --> Domain_Layer
    Backend_App --> Infra_Layer
    Infra_Layer --> Domain_Layer
```

---

## 2. Monorepo Directory & Naming Standards

```
kuma/
├── apps/
│   ├── server/src/
│   │   ├── api/
│   │   │   ├── assessments/
│   │   │   │   ├── create.ts          # POST /api/v1/assessments
│   │   │   │   ├── fetch.ts           # GET /api/v1/assessments/:id
│   │   │   │   ├── list.ts            # GET /api/v1/assessments
│   │   │   │   ├── update.ts          # PATCH /api/v1/assessments/:id
│   │   │   │   └── index.ts           # Mounts assessments router
│   │   │   └── executions/
│   │   │       ├── run.ts             # POST /api/v1/executions/run
│   │   │       ├── stream.ts          # GET /api/v1/executions/:id/stream (SSE)
│   │   │       └── index.ts
│   │   ├── hooks/                     # Server-level HTTP middleware & interceptor hooks
│   │   │   ├── authHook.ts            # Magic link token verification
│   │   │   ├── rateLimitHook.ts       # Rate limiting on execution bursts
│   │   │   ├── telemetryHook.ts       # Request latency and access logging
│   │   │   └── index.ts
│   │   ├── sse/                       # Real-time SSE streaming hubs
│   │   │   ├── executionHub.ts
│   │   │   └── index.ts
│   │   ├── config.ts                  # KUMA_ env config via Effect Config
│   │   ├── index.ts
│   │   └── main.ts                    # Server bootstrap & Layer composition
│   │
│   └── web/src/
│       ├── components/                # Deeply co-located UI primitives
│       │   ├── editor/
│       │   │   ├── monacoShell/
│       │   │   │   ├── hooks/         # Component-specific hooks
│       │   │   │   │   ├── useMonacoEditor.ts
│       │   │   │   │   ├── useEditorShortcuts.ts
│       │   │   │   │   └── index.ts
│       │   │   │   ├── monacoShell.tsx
│       │   │   │   ├── monacoShell.css.ts
│       │   │   │   ├── monacoShell.spec.ts
│       │   │   │   └── index.ts
│       │   │   └── tabBar/
│       │   │       ├── tabBar.tsx
│       │   │       ├── tabBar.css.ts
│       │   │       ├── tabBar.spec.ts
│       │   │       └── index.ts
│       │   ├── terminal/
│       │   │   ├── terminalView/
│       │   │   │   ├── hooks/
│       │   │   │   │   ├── useAnsiAutoScroll.ts
│       │   │   │   │   └── index.ts
│       │   │   │   ├── terminalView.tsx
│       │   │   │   ├── terminalView.css.ts
│       │   │   │   ├── terminalView.spec.ts
│       │   │   │   └── index.ts
│       │   │   └── statusBar/
│       │   │       ├── statusBar.tsx
│       │   │       ├── statusBar.css.ts
│       │   │       ├── statusBar.spec.ts
│       │   │       └── index.ts
│       │   ├── problem/
│       │   │   └── problemViewer/
│       │   │       ├── problemViewer.tsx
│       │   │       ├── problemViewer.css.ts
│       │   │       ├── problemViewer.spec.ts
│       │   │       └── index.ts
│       │   └── layout/
│       │       └── splitPane/
│       │           ├── splitPane.tsx
│       │           ├── splitPane.css.ts
│       │           └── index.ts
│       ├── hooks/                     # Global / cross-cutting application hooks
│       │   ├── useAuth.ts             # Candidate magic-link authentication
│       │   ├── useSSEStream.ts        # Generic SSE streaming consumer
│       │   ├── useKeyboardShortcut.ts # App-wide hotkey listener
│       │   └── index.ts
│       ├── state/
│       │   ├── workspaceStore.ts      # Effect Atoms (@effect-atom/atom)
│       │   └── index.ts
│       ├── mocks/
│       │   ├── fixtures.ts            # MOCK_CHALLENGE_TS & MOCK_CHALLENGE_PY
│       │   └── index.ts
│       └── styles/
│           ├── tokens.ts              # Strict design tokens (colors, space, radii)
│           ├── theme.css.ts
│           └── index.ts
│
├── packages/
│   ├── domain/src/                    # Entity-First pure domain models & rules
│   │   ├── common/
│   │   │   ├── schema.ts              # LanguageRuntime, FileMap
│   │   │   ├── errors.ts              # ValidationError
│   │   │   └── index.ts
│   │   ├── assessments/
│   │   │   ├── schema.ts              # AssessmentSession, SessionStatus, SessionId
│   │   │   ├── transition.ts          # Pure session state machine transitions
│   │   │   ├── expiry.ts              # Time calculation & deadline logic
│   │   │   ├── errors.ts              # SessionNotFoundError, InvalidTransitionError
│   │   │   └── index.ts
│   │   ├── challenges/
│   │   │   ├── schema.ts              # Challenge, ChallengeId, TestManifest
│   │   │   ├── errors.ts              # ChallengeNotFoundError, InvalidPayloadError
│   │   │   └── index.ts
│   │   ├── executions/
│   │   │   ├── schema.ts              # ExecutionRun, StreamChunks, TestCaseResult
│   │   │   ├── errors.ts              # ExecutionFailedError, TimeoutError
│   │   │   └── index.ts
│   │   ├── telemetry/
│   │   │   ├── schema.ts              # Keystroke deltas, blur/focus, paste events
│   │   │   ├── scoring.ts             # Composite candidate scoring formula
│   │   │   ├── anomaly.ts             # Keystroke burst & paste dump heuristics
│   │   │   ├── errors.ts              # TelemetryParseError
│   │   │   └── index.ts
│   │   └── index.ts                   # Root domain barrel export
│   │
│   └── infra/src/                     # Action-Based infrastructure adapters
│       ├── postgres/
│       │   ├── actions/
│       │   │   ├── assessments/
│       │   │   │   ├── create.ts      # Effect SQL INSERT into assessments
│       │   │   │   ├── fetch.ts       # Effect SQL SELECT WHERE id = :id
│       │   │   │   ├── list.ts        # Effect SQL SELECT paginated
│       │   │   │   ├── update.ts      # Effect SQL UPDATE assessments
│       │   │   │   └── index.ts
│       │   │   ├── executions/
│       │   │   │   ├── record.ts
│       │   │   │   └── index.ts
│       │   │   └── telemetry/
│       │   │       ├── appendBatch.ts
│       │   │       ├── fetchStream.ts
│       │   │       └── index.ts
│       │   ├── client.ts              # PgLive connection pool layer
│       │   ├── errors.ts              # PostgresConnectionError, QueryError
│       │   └── index.ts
│       │
│       ├── sandbox/
│       │   ├── actions/
│       │   │   ├── spawn.ts           # Spawns isolated Docker container / micro-VM
│       │   │   ├── execute.ts         # Runs Vitest / pytest inside container
│       │   │   ├── terminate.ts       # SIGKILL / cleanup container
│       │   │   └── index.ts
│       │   ├── parsers/
│       │   │   ├── vitest.ts          # Structured Vitest output parser
│       │   │   ├── pytest.ts          # Structured pytest output parser
│       │   │   └── index.ts
│       │   ├── hooks/                 # Sandbox container lifecycle hooks
│       │   │   ├── onContainerSpawn.ts
│       │   │   ├── onTimeout.ts
│       │   │   └── index.ts
│       │   ├── errors.ts              # ContainerTimeoutError, ContainerOOMError
│       │   └── index.ts
│       │
│       └── nebius/
│           ├── actions/
│           │   ├── generate.ts        # Prompts Nemotron to synthesize multi-file challenge
│           │   ├── evaluate.ts        # Prompts Nemotron to score candidate solution
│           │   └── index.ts
│           ├── prompts/
│           │   ├── challengeTemplate.ts
│           │   ├── evaluationTemplate.ts
│           │   └── index.ts
│           ├── errors.ts              # NebiusRateLimitError, SynthesisError
│           └── index.ts
│
├── docs/                              # Architecture, standards, and milestone plans
├── Justfile                           # Task runner (dev, test, lint, check, db)
└── biome.json                         # Formatting and linting configuration
```

---

## 3. Package Invariants & Separation of Concerns

1. **`packages/domain` is 100% Pure Business Logic**:
   - Zero external I/O (no DB, no HTTP, no Docker, no Node/DOM globals).
   - Contains entity schemas, branded IDs, state transitions, math/scoring, and domain error types.

2. **`packages/infra` Organizes External Services into Action Files**:
   - Database operations, container execution, and LLM queries are isolated into verb-based action files.
   - Each service folder owns its dedicated `errors.ts`.

3. **`apps/server` Dispatches HTTP Requests to Infra & Domain**:
   - Routes requests to corresponding actions and streams live execution logs over SSE.
   - Server middleware and interceptor hooks live in `apps/server/src/hooks/`.
   - Assembles the dependency graph using Effect Layers.

4. **`apps/web` Is Component-Driven with Effect Atoms**:
   - UI components are co-located with `.tsx`, `.css.ts`, Playwright `.spec.ts`, and component-specific `hooks/`.
   - Global application hooks live in `src/hooks/`.
   - Reactive state is managed via `@effect-atom/atom`.
   - Standalone mock fixtures (`mocks/fixtures.ts`) enable isolated frontend development.
