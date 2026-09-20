import { ExecutionStatusEnum } from '@kuma/domain'
import { Config, Effect, Exit, Layer, Ref, Result, Schema, Semaphore } from 'effect'
import { describe, expect, it } from 'vitest'
import { makeNebiusRunner, SandboxRunner, type SandboxRunnerShape } from './index'

describe('SandboxRunner', () => {
  it('dispatches execution using injected runner layer', async () => {
    const mockRunner: SandboxRunnerShape = {
      execute: (_payload) =>
        Effect.succeed({
          status: ExecutionStatusEnum.Passed,
          exitCode: 0,
          stdout: '3 pass\n0 fail',
          stderr: '',
          durationMs: 42,
          summary: { passed: 3, failed: 0, total: 3 },
        }),
    }

    const MockRunnerLayer = Layer.succeed(SandboxRunner, mockRunner)

    const program = Effect.gen(function* () {
      const runner = yield* SandboxRunner
      return yield* runner.execute({
        language: 'typescript',
        files: { 'index.ts': 'export const a = 1' },
      })
    }).pipe(Effect.provide(MockRunnerLayer))

    const result = await Effect.runPromise(program)
    expect(result.status).toBe(ExecutionStatusEnum.Passed)
    expect(result.exitCode).toBe(0)
    expect(result.summary?.passed).toBe(3)
  })

  it('fails with unimplemented error for makeNebiusRunner', async () => {
    const runner = await Effect.runPromise(makeNebiusRunner())
    const program = runner.execute({
      language: 'typescript',
      files: {},
    })

    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isFailure(exit)).toBe(true)
  })

  it('validates config when driver is set to nebius without api key', async () => {
    const customConfig = Config.all({
      driver: Config.succeed('nebius' as const),
      nebiusApiKey: Config.succeed(undefined as string | undefined),
      nebiusEndpoint: Config.succeed('https://api.nebius.ai/v1/sandboxes'),
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

    const exit = await Effect.runPromiseExit(Config.unwrap(customConfig))
    expect(Exit.isFailure(exit)).toBe(true)
  })

  it('throttles concurrent executions using Semaphore', async () => {
    const program = Effect.gen(function* () {
      const activeRef = yield* Ref.make(0)
      const maxActiveRef = yield* Ref.make(0)
      const sem = yield* Semaphore.make(2)

      const simulateTask = Effect.gen(function* () {
        const current = yield* Ref.updateAndGet(activeRef, (n) => n + 1)
        yield* Ref.update(maxActiveRef, (max) => Math.max(max, current))
        yield* Effect.sleep('15 millis')
        yield* Ref.update(activeRef, (n) => n - 1)
      }).pipe(sem.withPermit)

      yield* Effect.all(
        Array.from({ length: 8 }, () => simulateTask),
        {
          concurrency: 'unbounded',
        },
      )

      return yield* Ref.get(maxActiveRef)
    })

    const peak = await Effect.runPromise(program)
    expect(peak).toBe(2)
  })
})
