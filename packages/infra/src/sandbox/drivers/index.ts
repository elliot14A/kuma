import { SandboxConfig } from '@kuma/domain'
import { Config, Effect, Layer, Semaphore } from 'effect'
import { SandboxRunner } from '../runner'
import { makeLocalDockerRunner } from './local'
import { makeNebiusRunner } from './nebius'

export { LocalDockerRunner, makeLocalDockerRunner } from './local'
export { makeNebiusRunner, NebiusRunner } from './nebius'

export const Sandbox = Layer.effect(
  SandboxRunner,
  Effect.gen(function* () {
    const config = yield* Config.unwrap(SandboxConfig)
    const runner = yield* config.driver === 'nebius' ? makeNebiusRunner() : makeLocalDockerRunner()
    const sem = yield* Semaphore.make(config.maxConcurrency)

    return {
      execute: (payload) => runner.execute(payload).pipe(sem.withPermit),
    }
  }),
)
