import { PgClient } from '@effect/sql-pg'
import type { Challenge, PaginationResult } from '@kuma/domain'
import { Effect, Layer } from 'effect'
import { HttpRouter } from 'effect/unstable/http'
import { describe, expect, it } from 'vitest'
import type { ErrorResponse, Response } from '../respond'
import { challengesRouter } from './index'

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

describe('Challenges API Endpoints', () => {
  const validPayload = {
    title: 'Two Sum in TS',
    description: 'Implement two sum algorithm',
    language: 'typescript' as const,
    starterFiles: { 'src/index.ts': 'export function twoSum() {}' },
    testFiles: { 'test/index.test.ts': "import { it } from 'vitest'" },
    timeLimitMinutes: 30,
  }

  describe('POST /api/v1/challenges', () => {
    it('creates a challenge and returns 201 Created', async () => {
      const mockRow = {
        id: 'ch_test_123',
        ...validPayload,
        starterFiles: validPayload.starterFiles,
        testFiles: validPayload.testFiles,
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      })

      const response = await handler(request, undefined)
      expect(response.status).toBe(201)

      const body = (await response.json()) as Response<Challenge>
      expect(body.status).toBe('success')
      expect(body.message).toBe('challenge created successfully')
      expect(body.data.id).toBe('ch_test_123')
      expect(body.data.title).toBe(validPayload.title)
      expect(body.data.language).toBe('typescript')
      expect(body.data.starterFiles).toEqual(validPayload.starterFiles)
    })

    it('returns 400 Bad Request with standardized ErrorResponse when payload schema is invalid', async () => {
      const invalidPayload = {
        title: 'Missing other fields',
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      })

      const response = await handler(request, undefined)
      expect(response.status).toBe(400)

      const body = (await response.json()) as ErrorResponse
      expect(body.status).toBe('error')
      expect(body.code).toBe('INVALID_INPUT')
      expect(body.message).toBeTruthy()
      expect(body.op).toBe('challenges.create')
    })

    it('returns 400 Bad Request with standardized ErrorResponse when body is not valid JSON', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json-body{',
      })

      const response = await handler(request, undefined)
      expect(response.status).toBe(400)

      const body = (await response.json()) as ErrorResponse
      expect(body.status).toBe('error')
      expect(body.code).toBe('INVALID_INPUT')
      expect(body.message).toBeTruthy()
    })
  })

  describe('GET /api/v1/challenges/:id', () => {
    it('returns 200 OK with challenge when found', async () => {
      const mockRow = {
        id: 'ch_test_123',
        ...validPayload,
        starterFiles: validPayload.starterFiles,
        testFiles: validPayload.testFiles,
      }

      const sqlLayer = createMockSqlLayer(() => Effect.succeed([mockRow]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges/ch_test_123')
      const response = await handler(request, undefined)
      expect(response.status).toBe(200)

      const body = (await response.json()) as Response<Challenge>
      expect(body.status).toBe('success')
      expect(body.message).toBe('challenge fetched successfully')
      expect(body.data.id).toBe('ch_test_123')
      expect(body.data.title).toBe(validPayload.title)
    })

    it('returns 404 Not Found with standardized ErrorResponse when challenge does not exist', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges/ch_non_existent')
      const response = await handler(request, undefined)
      expect(response.status).toBe(404)

      const body = (await response.json()) as ErrorResponse
      expect(body.status).toBe('error')
      expect(body.code).toBe('NOT_FOUND')
      expect(body.message).toContain("Challenge with id 'ch_non_existent' not found")
      expect(body.op).toBe('challenges.fetch')
    })

    it('returns 500 Internal Server Error with standardized ErrorResponse when database fails', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.fail(new Error('database offline')))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges/ch_test_123')
      const response = await handler(request, undefined)
      expect(response.status).toBe(500)

      const body = (await response.json()) as ErrorResponse
      expect(body.status).toBe('error')
      expect(body.code).toBe('INTERNAL')
      expect(body.op).toBe('challenges.fetch')
    })
  })

  describe('GET /api/v1/challenges', () => {
    it('returns 200 OK with paginated list of challenges', async () => {
      const mockRows = [
        {
          id: 'ch_1',
          title: 'Challenge 1',
          description: 'Desc 1',
          language: 'typescript',
          starterFiles: {},
          testFiles: {},
          timeLimitMinutes: 30,
        },
        {
          id: 'ch_2',
          title: 'Challenge 2',
          description: 'Desc 2',
          language: 'python',
          starterFiles: {},
          testFiles: {},
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
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges?page=1&limit=10')
      const response = await handler(request, undefined)
      expect(response.status).toBe(200)

      const body = (await response.json()) as Response<PaginationResult<Challenge>>
      expect(body.status).toBe('success')
      expect(body.message).toBe('challenges listed successfully')
      expect(body.data.items).toHaveLength(2)
      expect(body.data.totalItems).toBe(2)
      expect(body.data.page).toBe(1)
      expect(body.data.limit).toBe(10)
      expect(body.data.totalPages).toBe(1)
      expect(body.data.items[0]?.id).toBe('ch_1')
      expect(body.data.items[1]?.id).toBe('ch_2')
    })
  })

  describe('DELETE /api/v1/challenges/:id', () => {
    it('returns 204 No Content on successful delete', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([{ id: 'ch_test_123' }]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges/ch_test_123', {
        method: 'DELETE',
      })
      const response = await handler(request, undefined)
      expect(response.status).toBe(204)
    })

    it('returns 404 Not Found with standardized ErrorResponse when challenge to delete is not found', async () => {
      const sqlLayer = createMockSqlLayer(() => Effect.succeed([]))
      const appLayer = Layer.merge(challengesRouter, sqlLayer)
      const { handler } = HttpRouter.toWebHandler(appLayer, { disableLogger: true })

      const request = new Request('http://localhost:8080/api/v1/challenges/ch_non_existent', {
        method: 'DELETE',
      })
      const response = await handler(request, undefined)
      expect(response.status).toBe(404)

      const body = (await response.json()) as ErrorResponse
      expect(body.status).toBe('error')
      expect(body.code).toBe('NOT_FOUND')
      expect(body.message).toContain("Challenge with id 'ch_non_existent' not found")
      expect(body.op).toBe('challenges.delete')
    })
  })
})
