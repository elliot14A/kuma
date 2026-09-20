import {
  type AssessmentId,
  AssessmentStatusEnum,
  type ChallengeId,
  makePagination,
} from '@kuma/domain'
import { Effect, Exit } from 'effect'
import { describe, expect, it } from 'vitest'
import { createMockSqlLayer } from '../common'
import { type CreateAssessmentInput, create, del, fetch, list, patch } from './index'

describe('Postgres Assessment Actions', () => {
  const samplePayload: CreateAssessmentInput = {
    challengeIds: ['ch_1' as ChallengeId, 'ch_2' as ChallengeId],
    candidateName: 'Jane Doe',
    candidateEmail: 'jane@example.com',
    metadata: {
      candidateFiles: {
        ch_1: { 'solution.ts': 'export const a = 1' },
      },
    },
  }

  describe('create', () => {
    it('creates an assessment with challenges in a transaction', async () => {
      const mockRow = {
        id: 'as_test_1',
        candidateName: samplePayload.candidateName,
        candidateEmail: samplePayload.candidateEmail,
        status: AssessmentStatusEnum.Invited,
        startedAt: null,
        submittedAt: null,
        metadata: samplePayload.metadata,
        createdAt: new Date('2026-09-19T10:00:00.000Z'),
        updatedAt: new Date('2026-09-19T10:00:00.000Z'),
      }

      const sqlLayer = createMockSqlLayer((strings) => {
        const query = strings.join(' ')
        if (query.includes('insert into assessments')) {
          return Effect.succeed([mockRow])
        }
        if (query.includes('insert into assessment_challenges')) {
          return Effect.succeed([])
        }
        return Effect.succeed([])
      })

      const program = create(samplePayload).pipe(Effect.provide(sqlLayer))
      const result = await Effect.runPromise(program)

      expect(result.id).toBe('as_test_1')
      expect(result.candidateName).toBe(samplePayload.candidateName)
      expect(result.candidateEmail).toBe(samplePayload.candidateEmail)
      expect(result.challengeIds).toEqual(['ch_1', 'ch_2'])
      expect(result.status).toBe(AssessmentStatusEnum.Invited)
    })

    it('maps SQL failure to DomainError.internal when assessment insert fails', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('db connection error')))

      const program = create(samplePayload).pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('DomainError')
          expect(JSON.stringify(failure)).toContain('INTERNAL')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })

  describe('fetch', () => {
    it('fetches an existing assessment by ID with aggregated challenges', async () => {
      const mockRow = {
        id: 'as_test_1',
        candidateName: 'Jane Doe',
        candidateEmail: 'jane@example.com',
        status: AssessmentStatusEnum.Active,
        startedAt: new Date('2026-09-19T10:00:00.000Z'),
        submittedAt: null,
        metadata: { candidateFiles: {} },
        createdAt: new Date('2026-09-19T10:00:00.000Z'),
        updatedAt: new Date('2026-09-19T10:00:00.000Z'),
        challengeIds: ['ch_1', 'ch_2'],
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))

      const program = fetch('as_test_1' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const result = await Effect.runPromise(program)

      expect(result.id).toBe('as_test_1')
      expect(result.candidateName).toBe('Jane Doe')
      expect(result.challengeIds).toEqual(['ch_1', 'ch_2'])
    })

    it('fails with DomainError.notFound when row does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = fetch('as_non_existent' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('NOT_FOUND')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('timeout')))

      const program = fetch('as_test_1' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('INTERNAL')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })

  describe('list', () => {
    it('returns empty pagination result when count is 0', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([{ count: 0 }]))

      const pagination = makePagination({ page: 1, limit: 10 })
      const program = list(pagination).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.items).toHaveLength(0)
      expect(result.totalItems).toBe(0)
      expect(result.totalPages).toBe(1)
    })

    it('returns a paginated list of assessments with aggregated challengeIds', async () => {
      const mockRows = [
        {
          id: 'as_1',
          candidateName: 'Candidate 1',
          candidateEmail: 'c1@example.com',
          status: AssessmentStatusEnum.Invited,
          startedAt: null,
          submittedAt: null,
          metadata: { candidateFiles: {} },
          createdAt: new Date('2026-09-19T10:00:00.000Z'),
          updatedAt: new Date('2026-09-19T10:00:00.000Z'),
          challengeIds: ['ch_1'],
        },
        {
          id: 'as_2',
          candidateName: 'Candidate 2',
          candidateEmail: 'c2@example.com',
          status: AssessmentStatusEnum.Active,
          startedAt: new Date('2026-09-19T10:30:00.000Z'),
          submittedAt: null,
          metadata: { candidateFiles: {} },
          createdAt: new Date('2026-09-19T10:00:00.000Z'),
          updatedAt: new Date('2026-09-19T10:00:00.000Z'),
          challengeIds: ['ch_1', 'ch_2'],
        },
      ]

      let callIndex = 0
      const sqlLayer = createMockSqlLayer(() => {
        callIndex++
        if (callIndex === 1) {
          return Effect.succeed([{ count: 2 }])
        }
        return Effect.succeed(mockRows)
      })

      const pagination = makePagination({ page: 1, limit: 10 })
      const program = list(pagination).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.items).toHaveLength(2)
      expect(result.totalItems).toBe(2)
      expect(result.page).toBe(1)
      expect(result.items[0]?.id).toBe('as_1')
      expect(result.items[0]?.challengeIds).toEqual(['ch_1'])
      expect(result.items[1]?.id).toBe('as_2')
      expect(result.items[1]?.challengeIds).toEqual(['ch_1', 'ch_2'])
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('query failed')))

      const program = list().pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('INTERNAL')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })

  describe('del', () => {
    it('deletes an existing assessment', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([{ id: 'as_test_1' }]))

      const program = del('as_test_1' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const result = await Effect.runPromise(program)

      expect(result).toBeUndefined()
    })

    it('fails with DomainError.notFound when row does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = del('as_non_existent' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('NOT_FOUND')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })

    it('maps SQL error to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('database error')))

      const program = del('as_test_1' as AssessmentId).pipe(Effect.provide(sqlLayer))
      const exit = await Effect.runPromiseExit(program)

      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('INTERNAL')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })

  describe('patch', () => {
    it('patches assessment fields and syncs challengeIds', async () => {
      const mockUpdated = {
        id: 'as_test_1',
        candidateName: 'Jane Smith',
        candidateEmail: 'jane.smith@example.com',
        status: AssessmentStatusEnum.Active,
        startedAt: new Date('2026-09-19T10:00:00.000Z'),
        submittedAt: null,
        metadata: { candidateFiles: {} },
        createdAt: new Date('2026-09-19T10:00:00.000Z'),
        updatedAt: new Date('2026-09-19T10:30:00.000Z'),
        challengeIds: ['ch_1', 'ch_3'],
      }

      const sqlLayer = createMockSqlLayer((strings) => {
        const query = strings.join(' ')
        if (query.includes('update assessments')) {
          return Effect.succeed([{ id: 'as_test_1' }])
        }
        if (query.includes('delete from assessment_challenges')) {
          return Effect.succeed([])
        }
        if (query.includes('insert into assessment_challenges')) {
          return Effect.succeed([])
        }
        if (query.includes('select') && query.includes('from assessments a')) {
          return Effect.succeed([mockUpdated])
        }
        return Effect.succeed([])
      })

      const program = patch('as_test_1' as AssessmentId, {
        candidateName: 'Jane Smith',
        status: AssessmentStatusEnum.Active,
        challengeIds: ['ch_1' as ChallengeId, 'ch_3' as ChallengeId],
      }).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('as_test_1')
      expect(result.candidateName).toBe('Jane Smith')
      expect(result.status).toBe(AssessmentStatusEnum.Active)
      expect(result.challengeIds).toEqual(['ch_1', 'ch_3'])
    })

    it('fails with DomainError.notFound when assessment does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = patch('as_non_existent' as AssessmentId, {
        candidateName: 'New Name',
      }).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('NOT_FOUND')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('update error')))

      const program = patch('as_test_1' as AssessmentId, {
        candidateName: 'New Name',
      }).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('INTERNAL')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })
})
