import { Effect } from 'effect'

export const run = Effect.gen(function* () {
  yield* Effect.log(
    '[kuma-cli] Web frontend dev server can be launched via `bun run dev:web` or `bun --filter @kuma/web dev`.',
  )
})
