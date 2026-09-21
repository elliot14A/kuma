import { Command } from 'effect/unstable/cli'
import { migrateCommand, serverCommand, webCommand } from './commands'

export const version = '0.1.0'

export const rootCommand = Command.make('kuma').pipe(
  Command.withSubcommands([migrateCommand, serverCommand, webCommand]),
  Command.withDescription('kuma - autonomous technical assessment platform cli'),
)

export const runCli = Command.runWith(rootCommand, {
  version,
})
