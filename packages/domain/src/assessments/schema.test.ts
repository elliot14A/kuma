import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import {
  Assessment,
  AssessmentId,
  AssessmentMetadata,
  AssessmentStatus,
  AssessmentStatusEnum,
  CreateAssessmentInput,
  PatchAssessmentInput,
} from './schema'

describe('Assessment Domain Schema', () => {
  const now = new Date('2026-09-19T10:00:00.000Z')

  it('decodes a valid assessment with multiple challenges', () => {
    const raw = {
      id: 'as_123',
      challengeIds: ['ch_1', 'ch_2'],
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
      status: AssessmentStatusEnum.Invited,
      startedAt: now,
      submittedAt: null,
      metadata: {
        candidateFiles: {
          ch_1: { 'src/solution.ts': 'export const solve = () => true' },
          ch_2: { 'main.py': 'def solve(): return True' },
        },
      },
      createdAt: now,
      updatedAt: now,
    }

    const decoded = Schema.decodeUnknownSync(Assessment)(raw)
    expect(decoded.id).toBe('as_123')
    expect(decoded.challengeIds).toEqual(['ch_1', 'ch_2'])
    expect(decoded.candidateName).toBe('John Doe')
    expect(decoded.candidateEmail).toBe('john@example.com')
    expect(decoded.status).toBe(AssessmentStatusEnum.Invited)
    expect(decoded.startedAt).toEqual(now)
    expect(decoded.submittedAt).toBeNull()
    expect(decoded.metadata.candidateFiles.ch_1?.['src/solution.ts']).toBe(
      'export const solve = () => true',
    )
    expect(decoded.metadata.candidateFiles.ch_2?.['main.py']).toBe('def solve(): return True')
    expect(decoded.createdAt).toEqual(now)
    expect(decoded.updatedAt).toEqual(now)
  })

  it('decodes an assessment with optional fields omitted', () => {
    const raw = {
      id: 'as_min_1',
      challengeIds: ['ch_1'],
      candidateName: 'Jane Doe',
      status: AssessmentStatusEnum.Active,
      metadata: {
        candidateFiles: {},
      },
      createdAt: now,
      updatedAt: now,
    }

    const decoded = Schema.decodeUnknownSync(Assessment)(raw)
    expect(decoded.id).toBe('as_min_1')
    expect(decoded.challengeIds).toEqual(['ch_1'])
    expect(decoded.candidateEmail).toBeUndefined()
    expect(decoded.startedAt).toBeUndefined()
    expect(decoded.submittedAt).toBeUndefined()
    expect(decoded.status).toBe(AssessmentStatusEnum.Active)
  })

  it('decodes valid CreateAssessmentInput without status or metadata', () => {
    const raw = {
      candidateName: 'John Doe',
      challengeIds: ['ch_1'],
    }
    const decoded = Schema.decodeUnknownSync(CreateAssessmentInput)(raw)
    expect(decoded.candidateName).toBe('John Doe')
    expect(decoded.challengeIds).toEqual(['ch_1'])
    expect(decoded.candidateEmail).toBeUndefined()
    expect(decoded.metadata).toBeUndefined()
  })

  it('decodes partial PatchAssessmentInput correctly', () => {
    const raw = {
      status: 'submitted',
      candidateEmail: 'newemail@example.com',
      challengeIds: ['ch_1', 'ch_3'],
    }
    const decoded = Schema.decodeUnknownSync(PatchAssessmentInput)(raw)
    expect(decoded.status).toBe(AssessmentStatusEnum.Submitted)
    expect(decoded.candidateEmail).toBe('newemail@example.com')
    expect(decoded.challengeIds).toEqual(['ch_1', 'ch_3'])
    expect(decoded.candidateName).toBeUndefined()
  })

  it('validates all AssessmentStatus enum values', () => {
    expect(Schema.decodeUnknownSync(AssessmentStatus)('invited')).toBe(AssessmentStatusEnum.Invited)
    expect(Schema.decodeUnknownSync(AssessmentStatus)('active')).toBe(AssessmentStatusEnum.Active)
    expect(Schema.decodeUnknownSync(AssessmentStatus)('submitted')).toBe(
      AssessmentStatusEnum.Submitted,
    )
    expect(Schema.decodeUnknownSync(AssessmentStatus)('expired')).toBe(AssessmentStatusEnum.Expired)

    expect(() => Schema.decodeUnknownSync(AssessmentStatus)('cancelled')).toThrow()
  })

  it('fails decoding on empty AssessmentId', () => {
    expect(() => Schema.decodeUnknownSync(AssessmentId)('')).toThrow()
  })

  it('fails decoding when invalid status is provided in Assessment', () => {
    const raw = {
      id: 'as_invalid_status',
      challengeIds: ['ch_1'],
      candidateName: 'John',
      status: 'pending',
      metadata: { candidateFiles: {} },
      createdAt: now,
      updatedAt: now,
    }
    expect(() => Schema.decodeUnknownSync(Assessment)(raw)).toThrow()
  })

  it('decodes valid AssessmentMetadata', () => {
    const raw = {
      candidateFiles: {
        ch_1: {
          'index.ts': 'console.log("hello")',
        },
      },
    }
    const decoded = Schema.decodeUnknownSync(AssessmentMetadata)(raw)
    expect(decoded.candidateFiles.ch_1?.['index.ts']).toBe('console.log("hello")')
  })
})
