import { DomainError } from '@kuma/domain'
import { Effect, Layer } from 'effect'
import { SandboxRunner, type SandboxRunnerShape } from '../runner'

export const makeNebiusRunner = (): Effect.Effect<SandboxRunnerShape> =>
  Effect.succeed({
    execute: () =>
      Effect.fail(
        DomainError.internal({
          message: 'nebius sandbox runner is not yet implemented',
          op: 'sandbox.execute.nebius',
        }),
      ),
  })

export const NebiusRunner = Layer.effect(SandboxRunner, makeNebiusRunner())
