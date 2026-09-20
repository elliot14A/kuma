import { HttpRouter } from 'effect/unstable/http'
import { create } from './create'
import { del } from './delete'
import { fetch } from './fetch'
import { list } from './list'
import { patch } from './patch'

export const challengesRoutes = [
  HttpRouter.route('POST', '/challenges', create),
  HttpRouter.route('GET', '/challenges/:id', fetch),
  HttpRouter.route('GET', '/challenges', list),
  HttpRouter.route('PATCH', '/challenges/:id', patch),
  HttpRouter.route('DELETE', '/challenges/:id', del),
]
