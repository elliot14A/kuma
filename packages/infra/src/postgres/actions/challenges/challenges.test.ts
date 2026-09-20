import { type ChallengeId, isDomainError, makePagination } from '@kuma/domain'
import { PostgresError } from '@kuma/infra/postgres'
import { Effect, Exit } from 'effect'
import { describe, expect, it } from 'vitest'
import { createMockSqlLayer } from '../common'
import { type CreateChallengeInput, create, del, fetch, list, patch } from './index'

describe('Postgres Challenge Actions', () => {
  const samplePayload: CreateChallengeInput = {
    title: 'Test Challenge',
    description: 'Solve this test challenge',
    language: 'typescript',
    timeLimitMinutes: 45,
    metadata: {
      starterFiles: { 'index.ts': "console.log('starter')" },
      testFiles: { 'index.test.ts': "console.log('test')" },
    },
  }

  describe('create', () => {
    it('creates a challenge', async () => {
      const mockRow = {
        id: 'ch_test_1',
        title: samplePayload.title,
        description: samplePayload.description,
        language: samplePayload.language,
        timeLimitMinutes: samplePayload.timeLimitMinutes,
        metadata: samplePayload.metadata,
        createdAt: '2026-09-19T10:00:00.000Z',
        updatedAt: '2026-09-19T10:00:00.000Z',
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))

      const program = create(samplePayload).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('ch_test_1')
      expect(result.title).toBe(samplePayload.title)
      expect(result.metadata).toEqual(samplePayload.metadata)
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('connection timeout')))

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
    it('fetches an existing challenge by ID', async () => {
      const mockRow = {
        id: 'ch_test_1',
        title: samplePayload.title,
        description: samplePayload.description,
        language: samplePayload.language,
        timeLimitMinutes: samplePayload.timeLimitMinutes,
        metadata: samplePayload.metadata,
        createdAt: '2026-09-19T10:00:00.000Z',
        updatedAt: '2026-09-19T10:00:00.000Z',
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))

      const program = fetch('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('ch_test_1')
      expect(result.title).toBe(samplePayload.title)
      expect(result.metadata).toEqual(samplePayload.metadata)
    })

    it('fails with DomainError.notFound when row does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = fetch('ch_non_existent' as ChallengeId).pipe(Effect.provide(sqlLayer))

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
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('database offline')))

      const program = fetch('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

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
    it('returns a paginated list of challenges', async () => {
      const mockRows = [
        {
          id: 'ch_1',
          title: 'Challenge 1',
          description: 'Desc 1',
          language: 'typescript',
          timeLimitMinutes: 30,
          metadata: { starterFiles: { 'index.ts': '' }, testFiles: { 'index.test.ts': '' } },
          createdAt: '2026-09-19T10:00:00.000Z',
          updatedAt: '2026-09-19T10:00:00.000Z',
        },
        {
          id: 'ch_2',
          title: 'Challenge 2',
          description: 'Desc 2',
          language: 'python',
          timeLimitMinutes: 45,
          metadata: { starterFiles: { 'main.py': '' }, testFiles: { 'test_main.py': '' } },
          createdAt: '2026-09-19T10:00:00.000Z',
          updatedAt: '2026-09-19T10:00:00.000Z',
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
      expect(result.totalPages).toBe(1)
      expect(result.items[0]?.id).toBe('ch_1')
      expect(result.items[1]?.id).toBe('ch_2')
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
    it('deletes an existing challenge', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([{ id: 'ch_test_1' }]))

      const program = del('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result).toBeUndefined()
    })

    it('fails with DomainError.notFound when row does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = del('ch_non_existent' as ChallengeId).pipe(Effect.provide(sqlLayer))

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

    it('maps foreign key constraint failure to DomainError.conflict', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('foreign key constraint')))

      const program = del('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(Exit.isFailure(exit)).toBe(true)
      Exit.match(exit, {
        onFailure: (failure) => {
          expect(JSON.stringify(failure)).toContain('CONFLICT')
        },
        onSuccess: () => {
          expect.unreachable('Expected Effect to fail')
        },
      })
    })
  })

  describe('patch', () => {
    it('patches an existing challenge', async () => {
      const mockUpdated = {
        id: 'ch_test_1',
        title: 'Patched Title',
        description: 'Patched Desc',
        language: 'typescript',
        timeLimitMinutes: 60,
        metadata: { starterFiles: {}, testFiles: {} },
        createdAt: '2026-09-19T10:00:00.000Z',
        updatedAt: '2026-09-19T10:30:00.000Z',
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockUpdated]))

      const program = patch('ch_test_1' as ChallengeId, {
        title: 'Patched Title',
        timeLimitMinutes: 60,
      }).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('ch_test_1')
      expect(result.title).toBe('Patched Title')
      expect(result.timeLimitMinutes).toBe(60)
    })

    it('fails with DomainError.notFound when challenge does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = patch('ch_non_existent' as ChallengeId, {
        title: 'New Title',
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

      const program = patch('ch_test_1' as ChallengeId, {
        title: 'New Title',
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

  describe('PostgresError', () => {
    it('maps 23505 (unique violation) to ALREADY_EXISTS', () => {
      const error = new PostgresError({
        cause: { code: '23505', message: 'duplicate key value violates unique constraint' },
        query: 'insert',
      })
      const domainErr = error.toDomainError('challenges.create')
      expect(isDomainError(domainErr)).toBe(true)
      expect(domainErr.code).toBe('ALREADY_EXISTS')
      expect(domainErr.op).toBe('challenges.create')
    })

    it('maps 23503 (foreign key violation) to CONFLICT', () => {
      const error = new PostgresError({
        cause: { code: '23503', message: 'violates foreign key constraint' },
      })
      const domainErr = error.toDomainError('challenges.del')
      expect(domainErr.code).toBe('CONFLICT')
    })

    it('maps 23502 (not null violation) and 23514 (check constraint) to INVALID_INPUT', () => {
      const notNullErr = new PostgresError({
        cause: { code: '23502' },
      }).toDomainError('challenges.create')
      expect(notNullErr.code).toBe('INVALID_INPUT')

      const checkErr = new PostgresError({
        cause: { code: '23514' },
      }).toDomainError('challenges.create')
      expect(checkErr.code).toBe('INVALID_INPUT')
    })

    it('extracts nested cause code', () => {
      const error = new PostgresError({
        cause: { cause: { code: '23505' } },
      })
      const domainErr = error.toDomainError()
      expect(domainErr.code).toBe('ALREADY_EXISTS')
    })

    it('falls back to string matching when code is absent', () => {
      const error = new PostgresError({
        cause: new Error('duplicate key value violates unique constraint'),
      })
      const domainErr = error.toDomainError()
      expect(domainErr.code).toBe('ALREADY_EXISTS')
    })

    it('maps unknown errors to INTERNAL', () => {
      const error = new PostgresError({
        cause: new Error('connection terminated unexpectedly'),
      })
      const domainErr = error.toDomainError()
      expect(domainErr.code).toBe('INTERNAL')
    })
  })
})
