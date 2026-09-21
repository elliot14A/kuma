import { BunRuntime } from '@effect/platform-bun'
import { serve } from './serve'

export { App, Router, runServer, Server, serve, webRouter } from './serve'

if (import.meta.main) {
  BunRuntime.runMain(serve)
}
