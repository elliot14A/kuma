import { Effect, FileSystem, Path } from 'effect'
import { HttpRouter, HttpServerRequest, HttpServerResponse } from 'effect/unstable/http'

const WEB_DIST = 'apps/web/dist'

export const webRouter = HttpRouter.add(
  'GET',
  '/*',
  Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const urlPath = req.url.split('?')[0] ?? req.url

    if (urlPath.startsWith('/api')) {
      return HttpServerResponse.empty({ status: 404 })
    }

    const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
    const targetPath = path.join(WEB_DIST, relPath)

    const exists = yield* fs.exists(targetPath)
    if (exists) {
      const stat = yield* fs.stat(targetPath)
      if (stat.type === 'File') {
        return yield* HttpServerResponse.file(targetPath)
      }
    }

    const indexPath = path.join(WEB_DIST, 'index.html')
    const indexExists = yield* fs.exists(indexPath)
    if (indexExists) {
      return yield* HttpServerResponse.file(indexPath)
    }

    return HttpServerResponse.empty({ status: 404 })
  }),
)

export const WebLayer = webRouter
