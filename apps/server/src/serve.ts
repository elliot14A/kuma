import { BunHttpServer, BunServices } from '@effect/platform-bun'
import { ServerConfig } from '@kuma/domain'
import { AppLogger, Pg, Sandbox } from '@kuma/infra'
import { Layer } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { ApiLayer } from './api'
import { WebLayer } from './web'

export const Server = BunHttpServer.layerConfig(ServerConfig)
export const Router = HttpRouter.layer.pipe(
  Layer.provideMerge(ApiLayer),
  Layer.provideMerge(WebLayer),
)

export const App = HttpRouter.serve(Router).pipe(
  Layer.provide(Server),
  Layer.provide(Pg),
  Layer.provide(Sandbox),
  Layer.provide(AppLogger),
  Layer.provide(BunServices.layer),
)

export const serve = Layer.launch(App)
export const runServer = serve
