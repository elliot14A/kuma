import { Layer } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { create } from './create'
import { del } from './delete'
import { fetch } from './fetch'
import { list } from './list'

export const challengesRouter = Layer.mergeAll(
  HttpRouter.add('POST', '/api/v1/challenges', create),
  HttpRouter.add('GET', '/api/v1/challenges/:id', fetch),
  HttpRouter.add('GET', '/api/v1/challenges', list),
  HttpRouter.add('DELETE', '/api/v1/challenges/:id', del),
)
