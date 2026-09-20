import type { DomainError, ExecutionResult, FileMap, LanguageRuntime } from '@kuma/domain'
import { Context, type Effect } from 'effect'

export interface SandboxExecutionPayload {
  readonly language: LanguageRuntime
  readonly files: FileMap
  readonly timeoutSeconds?: number | undefined
}

export interface SandboxRunnerShape {
  readonly execute: (
    payload: SandboxExecutionPayload,
  ) => Effect.Effect<ExecutionResult, DomainError>
}

export const SandboxRunner = Context.Service<SandboxRunnerShape>('SandboxRunner')
