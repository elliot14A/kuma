import { describe, expect, it } from 'bun:test'
import { AssessmentId, type ChallengeId, ExecutePayload } from '@kuma/domain'
import { Schema } from 'effect'

describe('Execution API Endpoint', () => {
  it('decodes execute request body schema properly', () => {
    const validBody = {
      challengeId: 'ch_1',
      candidateFiles: { 'index.ts': 'export const solve = () => 42' },
      timeoutSeconds: 15,
    }

    const decoded = Schema.decodeUnknownSync(ExecutePayload)(validBody)
    expect(decoded.challengeId).toBe('ch_1' as ChallengeId)
    expect(decoded.candidateFiles?.['index.ts']).toBe('export const solve = () => 42')
    expect(decoded.timeoutSeconds).toBe(15)
  })

  it('validates AssessmentId schema', () => {
    const validId = 'as_123'
    const decoded = Schema.decodeUnknownSync(AssessmentId)(validId)
    expect(decoded).toBe('as_123' as AssessmentId)
  })
})
