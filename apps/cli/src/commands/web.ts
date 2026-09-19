import { info } from '@kuma/infra'
import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* info(
    'web frontend dev server can be launched via bun run dev:web or bun --filter @kuma/web dev',
    {
      command: 'web',
    },
  )
})
