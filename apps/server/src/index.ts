import { Effect } from 'effect'
import { serve } from './serve'

export { App, Router, runServer, Server, serve, webRouter } from './serve'

if (import.meta.main) {
  Effect.runPromise(serve).catch((error) => {
    console.error('Server failed to start:', error)
    process.exit(1)
  })
}
