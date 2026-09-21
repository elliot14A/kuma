import { BunRuntime } from '@effect/platform-bun'
import type { Effect } from 'effect'
import { serve } from './serve'

export { App, Router, runServer, Server, serve } from './serve'

if (import.meta.main) {
  BunRuntime.runMain(serve as Effect.Effect<never, never, never>)
}
