import { BunHttpServer } from '@effect/platform-bun'
import { ServerConfig } from '@kuma/domain'
import { Pg } from '@kuma/infra'
import { Layer } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { challengesRouter } from './api'

const Server = BunHttpServer.layerConfig(ServerConfig)

const AppLive = HttpRouter.serve(challengesRouter).pipe(Layer.provide(Server), Layer.provide(Pg))

export const runServer = Layer.launch(AppLive)
