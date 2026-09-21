import { KumaApi, makePagination } from '@kuma/domain'
import * as challenges from '@postgres/challenges'
import { HttpApiBuilder } from 'effect/unstable/httpapi'

export const ChallengesHandlers = HttpApiBuilder.group(KumaApi, 'challenges', (handlers) =>
  handlers
    .handle('list', ({ query }) => challenges.list(makePagination(query)))
    .handle('fetch', ({ params }) => challenges.fetch(params.id))
    .handle('create', ({ payload }) => challenges.create(payload))
    .handle('patch', ({ params, payload }) => challenges.patch(params.id, payload))
    .handle('del', ({ params }) => challenges.del(params.id)),
)
