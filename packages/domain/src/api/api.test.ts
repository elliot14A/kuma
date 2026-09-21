import { describe, expect, it } from 'vitest'
import { AssessmentsGroup, ChallengesGroup, ExecutionsGroup, KumaApi } from './index'

describe('@kuma/domain API Schemas', () => {
  it('defines KumaApi with correct prefix and groups', () => {
    expect(KumaApi.identifier).toBe('kumaApi')
    expect(ChallengesGroup.identifier).toBe('challenges')
    expect(AssessmentsGroup.identifier).toBe('assessments')
    expect(ExecutionsGroup.identifier).toBe('executions')
  })
})
