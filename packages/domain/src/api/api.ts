import { HttpApi } from 'effect/unstable/httpapi'
import { AssessmentsGroup } from '../assessments/api'
import { ChallengesGroup } from '../challenges/api'
import { ExecutionsGroup } from '../executions/api'

export const KumaApi = HttpApi.make('kumaApi')
  .add(ChallengesGroup)
  .add(AssessmentsGroup)
  .add(ExecutionsGroup)
  .prefix('/api/v1')

export type KumaApi = typeof KumaApi
