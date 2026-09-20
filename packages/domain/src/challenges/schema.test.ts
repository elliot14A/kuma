import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import {
  Challenge,
  DomainError,
  getOffset,
  isDomainError,
  makePagination,
  makePaginationResult,
  PatchChallengeInput,
  toDomainError,
} from '../index'

describe('Challenge Domain Models', () => {
  it('decodes a valid TypeScript Challenge', () => {
    const now = new Date('2026-09-19T10:00:00.000Z')
    const raw = {
      id: 'ch_ts_token_bucket',
      title: 'Debug Token Bucket Limiter',
      description: 'Fix the leaky bucket algorithm.',
      language: 'typescript',
      timeLimitMinutes: 45,
      metadata: {
        starterFiles: { 'src/limiter.ts': 'export class RateLimiter {}' },
        testFiles: { 'test/limiter.test.ts': "import { describe } from 'vitest'" },
      },
      createdAt: now,
      updatedAt: now,
    }
    const decoded = Schema.decodeUnknownSync(Challenge)(raw)
    expect(decoded.language).toBe('typescript')
    expect(decoded.metadata.starterFiles['src/limiter.ts']).toBe('export class RateLimiter {}')
    expect(decoded.metadata.testFiles['test/limiter.test.ts']).toBe(
      "import { describe } from 'vitest'",
    )
    expect(decoded.timeLimitMinutes).toBe(45)
    expect(decoded.id).toBe('ch_ts_token_bucket')
    expect(decoded.createdAt).toEqual(now)
  })

  it('decodes a valid Python Challenge', () => {
    const now = new Date('2026-09-19T10:00:00.000Z')
    const raw = {
      id: 'ch_py_lru_cache',
      title: 'Implement Async Cache',
      description: 'Implement thread-safe TTL cache.',
      language: 'python',
      timeLimitMinutes: 30,
      metadata: {
        starterFiles: { 'cache.py': 'class TTLCache:\n    pass' },
        testFiles: { 'test_cache.py': 'import pytest' },
      },
      createdAt: now,
      updatedAt: now,
    }
    const decoded = Schema.decodeUnknownSync(Challenge)(raw)
    expect(decoded.language).toBe('python')
    expect(decoded.metadata.starterFiles['cache.py']).toBe('class TTLCache:\n    pass')
    expect(decoded.metadata.testFiles['test_cache.py']).toBe('import pytest')
    expect(decoded.timeLimitMinutes).toBe(30)
    expect(decoded.createdAt).toEqual(now)
  })

  it('decodes partial PatchChallengeInput correctly', () => {
    const raw = {
      title: 'Updated Challenge Title',
      timeLimitMinutes: 60,
    }
    const decoded = Schema.decodeUnknownSync(PatchChallengeInput)(raw)
    expect(decoded.title).toBe('Updated Challenge Title')
    expect(decoded.timeLimitMinutes).toBe(60)
    expect(decoded.description).toBeUndefined()
    expect(decoded.language).toBeUndefined()
    expect(decoded.metadata).toBeUndefined()
  })

  it('fails decoding on invalid language', () => {
    const now = new Date('2026-09-19T10:00:00.000Z')
    const raw = {
      id: 'ch_invalid_lang',
      title: 'Invalid Lang Challenge',
      description: 'Desc',
      language: 'rust',
      timeLimitMinutes: 10,
      metadata: { starterFiles: {}, testFiles: {} },
      createdAt: now,
      updatedAt: now,
    }
    expect(() => Schema.decodeUnknownSync(Challenge)(raw)).toThrow()
  })

  it('fails decoding on empty ChallengeId', () => {
    const now = new Date('2026-09-19T10:00:00.000Z')
    const raw = {
      id: '',
      title: 'Empty ID Challenge',
      description: 'Desc',
      language: 'typescript',
      timeLimitMinutes: 10,
      metadata: { starterFiles: {}, testFiles: {} },
      createdAt: now,
      updatedAt: now,
    }
    expect(() => Schema.decodeUnknownSync(Challenge)(raw)).toThrow()
  })

  describe('DomainError', () => {
    it('creates notFound error with standard props', () => {
      const err = DomainError.notFound({ entity: 'Challenge', id: 'ch_123' })
      expect(isDomainError(err)).toBe(true)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe("Challenge with id 'ch_123' not found")
    })

    it('creates invalidInput error', () => {
      const err = DomainError.invalidInput({ message: 'Malformed JSON', op: 'challenges.create' })
      expect(err.code).toBe('INVALID_INPUT')
      expect(err.op).toBe('challenges.create')
    })

    it('converts custom service errors via toDomainError', () => {
      const customServiceError = {
        toDomainError: () => DomainError.conflict({ message: 'Database constraint failed' }),
      }
      const converted = toDomainError(customServiceError)
      expect(converted.code).toBe('CONFLICT')
      expect(converted.message).toBe('Database constraint failed')
    })
  })

  describe('Pagination', () => {
    it('applies defaults for empty pagination', () => {
      const p = makePagination()
      expect(p.page).toBe(1)
      expect(p.limit).toBe(10)
      expect(p.sortOrder).toBe('desc')
      expect(p.params).toEqual({})
    })

    it('parses strings and enforces limit bounds', () => {
      const p = makePagination({ page: '2', limit: '200', sortOrder: 'asc' })
      expect(p.page).toBe(2)
      expect(p.limit).toBe(100)
      expect(p.sortOrder).toBe('asc')
      expect(getOffset(p)).toBe(100)
    })

    it('collects extra query parameters into params', () => {
      const p = makePagination({
        page: 1,
        limit: 10,
        language: 'typescript',
        difficulty: 'hard',
      })
      expect(p.params).toEqual({
        language: 'typescript',
        difficulty: 'hard',
      })
    })

    it('constructs standard PaginationResult', () => {
      const p = makePagination({ page: 1, limit: 10 })
      const res = makePaginationResult(['item1', 'item2'], 25, p)
      expect(res.totalItems).toBe(25)
      expect(res.totalPages).toBe(3)
      expect(res.hasNextPage).toBe(true)
      expect(res.hasPrevPage).toBe(false)
      expect(res.items).toHaveLength(2)
    })
  })
})
