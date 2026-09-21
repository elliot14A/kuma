import { KumaApi } from '@kuma/domain'
import { Layer } from 'effect'
import { HttpApiBuilder } from 'effect/unstable/httpapi'
import { AssessmentsHandlers } from './assessments'
import { ChallengesHandlers } from './challenges'
import { ExecutionsHandlers } from './executions'

export const ApiLayer = HttpApiBuilder.layer(KumaApi).pipe(
  Layer.provide(ChallengesHandlers),
  Layer.provide(AssessmentsHandlers),
  Layer.provide(ExecutionsHandlers),
)
