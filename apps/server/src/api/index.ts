import { HttpRouter } from 'effect/unstable/http'
import { assessmentsRoutes } from './assessments'
import { challengesRoutes } from './challenges'
import { healthRoutes } from './health'

export { type ErrorResponse, type Response, type ResponseOptions, response } from './respond'

export const apiRouter = HttpRouter.addAll(
  [...assessmentsRoutes, ...challengesRoutes, ...healthRoutes],
  {
    prefix: '/api/v1',
  },
)
