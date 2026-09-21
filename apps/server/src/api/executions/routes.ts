import { HttpRouter } from 'effect/unstable/http'
import { execute } from './execute'

export const executionsRoutes = [HttpRouter.route('POST', '/assessments/:id/execute', execute)]
