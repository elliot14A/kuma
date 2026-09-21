import { info } from '@kuma/infra'
import { Effect } from 'effect'
import { Command } from 'effect/unstable/cli'

export const webCommand = Command.make('web', {}, () =>
  Effect.gen(function* () {
    yield* info(
      'web frontend dev server can be launched via bun run dev:web or bun --filter @kuma/web dev',
      { command: 'web' },
    )
  }),
).pipe(Command.withDescription('start web frontend dev server instructions'))
