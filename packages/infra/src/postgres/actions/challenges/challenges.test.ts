import { PgClient } from '@effect/sql-pg'
import { type ChallengeId, makePagination } from '@kuma/domain'
import { Effect, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { PostgresError } from '../../error'
import { type CreateChallengeInput, create, del, fetch, list } from './index'

const createMockSqlLayer = (
  handler: (strings: TemplateStringsArray, values: unknown[]) => Effect.Effect<unknown[], unknown>,
) => {
  const mockSql = Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => handler(strings, values),
    {
      safe: null,
      withoutTransforms: () => mockSql,
      reserve: Effect.die('not implemented'),
      withTransaction: <A, E, R>(self: Effect.Effect<A, E, R>) => self,
      reactive: () => Effect.die('not implemented'),
      reactiveMailbox: () => Effect.die('not implemented'),
      config: {},
      json: (data: unknown) => data,
      listen: () => Effect.die('not implemented'),
      notify: () => Effect.die('not implemented'),
    },
  )

  return Layer.succeed(PgClient.PgClient, mockSql as unknown as PgClient.PgClient)
}

describe('Postgres Challenge Actions', () => {
  const samplePayload: CreateChallengeInput = {
    title: 'Test Challenge',
    description: 'Solve this test challenge',
    language: 'typescript',
    starterFiles: { 'index.ts': "console.log('starter')" },
    testFiles: { 'index.test.ts': "console.log('test')" },
    timeLimitMinutes: 45,
  }

  describe('create', () => {
    it('creates a challenge', async () => {
      const mockRow = {
        id: 'ch_test_1',
        title: samplePayload.title,
        description: samplePayload.description,
        language: samplePayload.language,
        starterFiles: samplePayload.starterFiles,
        testFiles: samplePayload.testFiles,
        timeLimitMinutes: samplePayload.timeLimitMinutes,
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))

      const program = create(samplePayload).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('ch_test_1')
      expect(result.title).toBe(samplePayload.title)
      expect(result.starterFiles).toEqual(samplePayload.starterFiles)
      expect(result.testFiles).toEqual(samplePayload.testFiles)
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('connection timeout')))

      const program = create(samplePayload).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        const failure = exit.cause
        expect(JSON.stringify(failure)).toContain('DomainError')
        expect(JSON.stringify(failure)).toContain('INTERNAL')
      }
    })
  })

  describe('fetch', () => {
    it('fetches an existing challenge by ID', async () => {
      const mockRow = {
        id: 'ch_test_1',
        title: samplePayload.title,
        description: samplePayload.description,
        language: samplePayload.language,
        starterFiles: samplePayload.starterFiles,
        testFiles: samplePayload.testFiles,
        timeLimitMinutes: samplePayload.timeLimitMinutes,
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))

      const program = fetch('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const result = await Effect.runPromise(program)
      expect(result.id).toBe('ch_test_1')
      expect(result.title).toBe(samplePayload.title)
    })

    it('fails with DomainError.notFound when row does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))

      const program = fetch('ch_non_existent' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        expect(JSON.stringify(exit.cause)).toContain('NOT_FOUND')
      }
    })

    it('maps SQL failure to DomainError.internal', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('database offline')))

      const program = fetch('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        expect(JSON.stringify(exit.cause)).toContain('INTERNAL')
      }
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
          starterFiles: { 'index.ts': '' },
          testFiles: { 'index.test.ts': '' },
          timeLimitMinutes: 30,
        },
        {
          id: 'ch_2',
          title: 'Challenge 2',
          description: 'Desc 2',
          language: 'python',
          starterFiles: { 'main.py': '' },
          testFiles: { 'test_main.py': '' },
          timeLimitMinutes: 45,
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
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        expect(JSON.stringify(exit.cause)).toContain('INTERNAL')
      }
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
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        expect(JSON.stringify(exit.cause)).toContain('NOT_FOUND')
      }
    })

    it('maps foreign key constraint failure to DomainError.conflict', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('foreign key constraint')))

      const program = del('ch_test_1' as ChallengeId).pipe(Effect.provide(sqlLayer))

      const exit = await Effect.runPromiseExit(program)
      expect(exit._tag).toBe('Failure')
      if (exit._tag === 'Failure') {
        expect(JSON.stringify(exit.cause)).toContain('CONFLICT')
      }
    })
  })

  describe('PostgresError', () => {
    it('maps 23505 (unique violation) to ALREADY_EXISTS', () => {
      const error = new PostgresError({
        cause: { code: '23505', message: 'duplicate key value violates unique constraint' },
        query: 'insert',
      })
      const domainErr = error.toDomainError('challenges.create')
      expect(domainErr._tag).toBe('DomainError')
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
