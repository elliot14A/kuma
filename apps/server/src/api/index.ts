import { HttpRouter } from 'effect/unstable/http'
import { assessmentsRoutes } from './assessments'
import { challengesRoutes } from './challenges'
import { executionsRoutes } from './executions'
import { healthRoutes } from './health'

export { type ErrorResponse, type Response, type ResponseOptions, response } from './respond'

export const apiRouter = HttpRouter.addAll(
  [...assessmentsRoutes, ...challengesRoutes, ...executionsRoutes, ...healthRoutes],
  {
    prefix: '/api/v1',
  },
)
