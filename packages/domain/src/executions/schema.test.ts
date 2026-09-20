import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import {
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
  ExecutionStatusEnum,
} from './schema'

describe('Execution Domain Schemas', () => {
  it('decodes a valid execution request', () => {
    const raw = {
      challengeId: 'ch_1',
      assessmentId: 'as_1',
      candidateFiles: { 'index.ts': 'export const solve = () => true' },
      timeoutSeconds: 30,
    }
    const decoded = Schema.decodeUnknownSync(ExecutionRequest)(raw)
    expect(decoded.challengeId).toBe('ch_1')
    expect(decoded.assessmentId).toBe('as_1')
    expect(decoded.timeoutSeconds).toBe(30)
  })

  it('decodes a valid execution result with test summary', () => {
    const raw = {
      status: 'passed',
      exitCode: 0,
      stdout: 'all 5 tests passed',
      stderr: '',
      durationMs: 450,
      summary: { passed: 5, failed: 0, total: 5 },
    }
    const decoded = Schema.decodeUnknownSync(ExecutionResult)(raw)
    expect(decoded.status).toBe(ExecutionStatusEnum.Passed)
    expect(decoded.exitCode).toBe(0)
    expect(decoded.summary?.passed).toBe(5)
  })

  it('validates execution status enum values', () => {
    expect(Schema.decodeUnknownSync(ExecutionStatus)('passed')).toBe(ExecutionStatusEnum.Passed)
    expect(Schema.decodeUnknownSync(ExecutionStatus)('failed')).toBe(ExecutionStatusEnum.Failed)
    expect(Schema.decodeUnknownSync(ExecutionStatus)('timeout')).toBe(ExecutionStatusEnum.Timeout)
    expect(Schema.decodeUnknownSync(ExecutionStatus)('error')).toBe(ExecutionStatusEnum.Error)
    expect(() => Schema.decodeUnknownSync(ExecutionStatus)('unknown')).toThrow()
  })
})
