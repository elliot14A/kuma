import { BunHttpServer } from '@effect/platform-bun'
import { ServerConfig } from '@kuma/domain'
import { LoggerLive, Pg } from '@kuma/infra'
import { Effect, Layer } from 'effect'
import { HttpRouter, HttpServerRequest, HttpServerResponse } from 'effect/unstable/http'
import { challengesRouter, healthRouter } from './api'

const WEB_DIST = 'apps/web/dist'

const getContentType = (p: string): string => {
  if (p.endsWith('.html')) return 'text/html; charset=utf-8'
  if (p.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (p.endsWith('.css')) return 'text/css; charset=utf-8'
  if (p.endsWith('.svg')) return 'image/svg+xml'
  if (p.endsWith('.png')) return 'image/png'
  if (p.endsWith('.json')) return 'application/json'
  if (p.endsWith('.ico')) return 'image/x-icon'
  if (p.endsWith('.woff2')) return 'font/woff2'
  if (p.endsWith('.woff')) return 'font/woff'
  return 'application/octet-stream'
}

export const webRouter = HttpRouter.add(
  'GET',
  '/*',
  Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest
    const urlPath = req.url.split('?')[0] ?? req.url

    if (urlPath.startsWith('/api')) {
      return HttpServerResponse.empty({ status: 404 })
    }

    const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
    const file = Bun.file(`${WEB_DIST}/${relPath}`)

    const exists = yield* Effect.promise(() => file.exists())
    if (exists) {
      const bytes = yield* Effect.promise(() => file.arrayBuffer())
      const headers: Record<string, string> = {
        'Content-Type': getContentType(relPath),
        'Cache-Control': relPath.startsWith('assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      }
      return HttpServerResponse.raw(new Uint8Array(bytes), {
        status: 200,
        headers,
      })
    }

    const indexFile = Bun.file(`${WEB_DIST}/index.html`)
    const indexExists = yield* Effect.promise(() => indexFile.exists())
    if (indexExists) {
      const bytes = yield* Effect.promise(() => indexFile.arrayBuffer())
      return HttpServerResponse.raw(new Uint8Array(bytes), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      })
    }

    return HttpServerResponse.empty({ status: 404 })
  }),
)

const Server = BunHttpServer.layerConfig(ServerConfig)
const Router = Layer.mergeAll(challengesRouter, healthRouter, webRouter)

const App = HttpRouter.serve(Router).pipe(
  Layer.provide(Server),
  Layer.provide(Pg),
  Layer.provide(LoggerLive),
)

export const runServer = Layer.launch(App)
