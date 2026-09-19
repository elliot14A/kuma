# 🏗️ Challenge File Storage & Dual-Engine Execution Sandbox Specification

**Date**: 2026-09-19  
**Status**: Approved Design  
**Author**: Kuma Architecture Team  

---

## 1. Executive Summary

This specification defines the production-grade architecture for **Challenge File Storage**, **Candidate Workspace Lifecycle**, and **Dual-Engine Code Execution Sandboxing** within the **Kuma (熊)** platform.

Kuma evaluates real-world software engineering capabilities through multi-file repository challenges across TypeScript and Python. The architecture adheres to industry-standard patterns established by production technical assessment platforms (HackerRank, CodeSignal, LeetCode) utilizing:
1. **JSONB Repository Storage** in PostgreSQL for immutable challenge templates and live candidate workspace snapshots.
2. **The Overlay Execution Model** separating candidate-visible tests from authoritative server-side hidden grading suites.
3. **Dual-Engine Execution Service** implementing Docker-based ephemeral container isolation for local development and Nebius Sandboxed MicroVMs for production.
4. **Structured JSON Telemetry & Test Reporting** streamed in real-time over Server-Sent Events (SSE).

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Storage_Layer ["1. Template & State Layer (PostgreSQL)"]
        ChallengeDB["challenges table\n• starter_files (JSONB FileMap)\n• test_files (Hidden JSONB FileMap)"]
        AssessmentDB["assessments table\n• candidate_files (Live JSONB FileMap)\n• status & telemetry logs"]
    end

    subgraph Candidate_Arena ["2. Candidate Arena UI (apps/web)"]
        MonacoWorkspace["Monaco Shell (Multi-File Editor)\n• In-memory FileMap\n• Debounced auto-save sync"]
        TerminalConsole["ANSI Streaming Console\n• Real-time SSE Execution Stream"]
    end

    subgraph Execution_Abstraction ["3. Execution Service Abstraction (@kuma/infra)"]
        ExecutionTag["ExecutionService (Context.Tag)\n• execute(payload): Stream<ExecutionChunk, DomainError>"]
        DockerEngine["Local Dev: Docker Runner\n• Ephemeral tmpfs/tempdir mount\n• acquireRelease guaranteed cleanup\n• Pre-warmed runner images"]
        NebiusEngine["Production: Nebius Sandbox\n• Isolated MicroVM API\n• Hard resource & network isolation\n• High-concurrency throughput"]
    end

    subgraph Grader_Engine ["4. Test Runners & Telemetry"]
        TS_Runner["TypeScript: Bun / Vitest JSON Reporter"]
        Py_Runner["Python: pytest JSON Report"]
        GraderFilter["Grader Filter & Redactor\n• Redacts internal filesystem paths\n• Formats assertions for Arena UI"]
    end

    ChallengeDB -->|Clone starter_files on assessment start| AssessmentDB
    AssessmentDB <-->|Live sync| MonacoWorkspace
    MonacoWorkspace -->|1. 'Run' (candidate_files + sample tests)\n2. 'Submit' (candidate_files + hidden test_files)| ExecutionTag
    ExecutionTag -->|Local Dev| DockerEngine
    ExecutionTag -->|Production| NebiusEngine
    DockerEngine --> TS_Runner
    DockerEngine --> Py_Runner
    NebiusEngine --> TS_Runner
    NebiusEngine --> Py_Runner
    TS_Runner --> GraderFilter
    Py_Runner --> GraderFilter
    GraderFilter -->|SSE Stream| TerminalConsole
```

---

## 3. Data Models & Repository Representation

### 3.1 Domain Types (`packages/domain`)

```typescript
// Branded ID types
export const ChallengeId = Schema.String.pipe(Schema.brand("ChallengeId"))
export type ChallengeId = typeof ChallengeId.Type

export const AssessmentId = Schema.String.pipe(Schema.brand("AssessmentId"))
export type AssessmentId = typeof AssessmentId.Type

// Supported runtimes
export const LanguageRuntime = Schema.Literals(["typescript", "python"])
export type LanguageRuntime = typeof LanguageRuntime.Type

// In-memory & JSONB file map representation
export const FileMap = Schema.Record(Schema.String, Schema.String)
export type FileMap = typeof FileMap.Type
```

### 3.2 Challenge Entity Schema

```typescript
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

### 3.3 PostgreSQL Storage Mapping

- **`challenges` Table**:
  - `id`: `uuid primary key default uuid_generate_v4()`
  - `title`: `text not null`
  - `description`: `text not null`
  - `language`: `text not null` (`typescript` / `python`)
  - `starter_files`: `jsonb not null` — Immutable candidate starting files (e.g. `src/index.ts`, `src/index.test.ts`, `package.json`).
  - `test_files`: `jsonb not null` — Proprietary grading test suite and fixtures (e.g. `tests/grader.test.ts`).
  - `time_limit_minutes`: `integer not null default 45`
- **`assessments` Table**:
  - `id`: `uuid primary key default uuid_generate_v4()`
  - `challenge_id`: `uuid references challenges(id) on delete restrict`
  - `candidate_files`: `jsonb not null` — Mutable snapshot of current candidate work.
  - `status`: `text not null` (`NOT_STARTED` | `IN_PROGRESS` | `SUBMITTED` | `EXPIRED`)

---

## 4. The Overlay Execution Model

Kuma strictly isolates the candidate's custom workspace from the grading evaluation harness:

| Action | Payload Merging Strategy | Primary Purpose | Test Visibility |
| :--- | :--- | :--- | :--- |
| **Run Code** | `candidate_files` (includes candidate's own sample test edits) | Fast feedback, debugging, checking candidate-written test assertions | Full stdout/stderr & test breakdown visible to candidate |
| **Submit / Evaluate** | `candidate_files` + **autoritative overwrite** of `test_files` | Formal assessment grading, scoring, edge-case benchmarking | Test pass count & names returned; proprietary fixtures redacted |

---

## 5. Dual-Engine Execution Service

### 5.1 Service Interface Definition

```typescript
export interface TestCaseResult {
  readonly name: string
  readonly status: 'passed' | 'failed' | 'skipped' | 'timed_out'
  readonly durationMs: number
  readonly failureMessage?: string
}

export interface ExecutionSummary {
  readonly totalTests: number
  readonly passedTests: number
  readonly failedTests: number
  readonly durationMs: number
  readonly testCases: readonly TestCaseResult[]
}

export interface ExecutionChunk {
  readonly type: 'stdout' | 'stderr' | 'result' | 'error'
  readonly data: string | ExecutionSummary
}

export class ExecutionService extends Context.Tag("ExecutionService")<
  ExecutionService,
  {
    readonly execute: (
      files: FileMap,
      testFiles: FileMap,
      language: LanguageRuntime,
      timeoutSeconds: number,
    ) => Stream.Stream<ExecutionChunk, DomainError>
  }
>() {}
```

### 5.2 Local Development Engine (`DockerRunnerLive`)

1. **Resource Acquisition**:
   - Uses `Effect.acquireRelease` to provision an ephemeral directory (`/tmp/kuma-run-<id>`).
   - Writes all files to the temporary filesystem.
2. **Container Invocation**:
   - Mounts `/tmp/kuma-run-<id>` as a volume inside the pre-built `kuma-runner-ts` (Bun + Vitest) or `kuma-runner-py` (Python 3.12 + Pytest) Docker image.
   - Restricts CPU (`--cpus="1.0"`), memory (`--memory="512m"`), and disables networking (`--network=none`).
3. **Stream Execution**:
   - Streams process `stdout` and `stderr` through an Effect Stream.
   - Captures and parses the JSON test report (`vitest run --reporter=json` / `pytest --json-report`).
4. **Guaranteed Release**:
   - `Effect.acquireRelease` automatically deletes the temporary directory and terminates container fibers upon completion, timeout, or client cancellation.

### 5.3 Production Engine (`NebiusRunnerLive`)

1. **Nebius Sandbox API Integration**:
   - Serializes the merged `FileMap` into the Nebius Sandbox microVM request payload.
   - Sets strict isolation flags, memory limits, and timeout boundaries.
2. **Execution & Log Streaming**:
   - Streams microVM execution output in real time over HTTP/2 / SSE chunks.
   - Collects structured telemetry (execution time, memory peak, anomaly markers).

---

## 6. Security, Isolation & Path Sanitization

1. **No Filesystem Traversal**: File paths in `FileMap` are validated against regex `^[a-zA-Z0-9_\-\.\/]+$` and prohibited from containing `..` or absolute path prefixes.
2. **Network Isolation**: All test execution occurs with `--network=none` or sandbox network airgapping to prevent external data exfiltration or reverse shells.
3. **Path Redaction**: Internal server directory prefixes (e.g. `/tmp/kuma-run-xyz/`) are stripped from stack traces and test logs before streaming to the candidate arena.

---

## 7. Verification & Testing Plan

1. **Unit Tests**:
   - `FileMap` path sanitization and directory extraction tests.
   - Dual-runtime (TypeScript & Python) JSON test report parser tests.
2. **Integration Tests**:
   - Docker local runner execution test with sample passing & failing tests.
   - Timeout enforcement test (infinite loop termination).
   - `acquireRelease` temp directory cleanup verification.
3. **E2E API Tests**:
   - `POST /api/v1/executions/run` and `GET /api/v1/executions/:id/stream` SSE validation.
