import { HttpRouter } from 'effect/unstable/http'
import { create } from './create'
import { del } from './delete'
import { fetch } from './fetch'
import { list } from './list'
import { patch } from './patch'

export const assessmentsRoutes = [
  HttpRouter.route('POST', '/assessments', create),
  HttpRouter.route('GET', '/assessments/:id', fetch),
  HttpRouter.route('GET', '/assessments', list),
  HttpRouter.route('PATCH', '/assessments/:id', patch),
  HttpRouter.route('DELETE', '/assessments/:id', del),
]
