import { Effect } from 'effect'
import { parseCliArgs } from './cli'
import { executeCommand } from './commands'

const main = async (): Promise<void> => {
  const { command } = parseCliArgs(process.argv.slice(2))

  try {
    await Effect.runPromise(executeCommand(command))
  } catch (error) {
    console.error('[kuma-cli] Command execution failed:', error)
    process.exit(1)
  }
}

main()
