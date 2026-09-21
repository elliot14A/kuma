import { BunRuntime, BunServices } from '@effect/platform-bun'
import { AppLogger } from '@kuma/infra'
import { Effect, Layer } from 'effect'
import { Command } from 'effect/unstable/cli'
import { rootCommand, version } from './cli'

const MainLayer = Layer.merge(BunServices.layer, AppLogger)

const program = Command.run(rootCommand, {
  version,
}).pipe(Effect.provide(MainLayer))

BunRuntime.runMain(program)
