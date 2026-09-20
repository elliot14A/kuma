import { describe, expect, it } from 'bun:test'
import type { AssessmentId, ChallengeId } from '@kuma/domain'
import { Schema } from 'effect'
import { ExecuteBodySchema, PathParams } from './execute'

describe('Execution API Endpoint', () => {
  it('decodes execute request body schema properly', () => {
    const validBody = {
      challengeId: 'ch_1',
      candidateFiles: { 'index.ts': 'export const solve = () => 42' },
      timeoutSeconds: 15,
    }

    const decoded = Schema.decodeUnknownSync(ExecuteBodySchema)(validBody)
    expect(decoded.challengeId).toBe('ch_1' as ChallengeId)
    expect(decoded.candidateFiles?.['index.ts']).toBe('export const solve = () => 42')
    expect(decoded.timeoutSeconds).toBe(15)
  })

  it('validates PathParams schema', () => {
    const validParams = { id: 'as_123' }
    const decoded = Schema.decodeUnknownSync(PathParams)(validParams)
    expect(decoded.id).toBe('as_123' as AssessmentId)
  })
})
