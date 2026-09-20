import { AppLogger } from '@kuma/infra'
import { Effect } from 'effect'
import { parseCliArgs } from './cli'
import { executeCommand } from './commands'

const { command } = parseCliArgs(process.argv.slice(2))

const program = executeCommand(command).pipe(
  Effect.provide(AppLogger),
  Effect.catch((err) =>
    Effect.gen(function* () {
      yield* Effect.logError(`[kuma-cli] command execution failed: ${err}`)
      process.exit(1)
    }),
  ),
)

Effect.runPromise(program)
