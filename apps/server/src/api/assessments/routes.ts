import { KumaApi, makePagination } from '@kuma/domain'
import * as assessments from '@postgres/assessments'
import { HttpApiBuilder } from 'effect/unstable/httpapi'

export const AssessmentsHandlers = HttpApiBuilder.group(KumaApi, 'assessments', (handlers) =>
  handlers
    .handle('list', ({ query }) => assessments.list(makePagination(query)))
    .handle('fetch', ({ params }) => assessments.fetch(params.id))
    .handle('create', ({ payload }) => assessments.create(payload))
    .handle('patch', ({ params, payload }) => assessments.patch(params.id, payload))
    .handle('del', ({ params }) => assessments.del(params.id)),
)
