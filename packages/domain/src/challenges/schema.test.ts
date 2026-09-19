import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import {
  Challenge,
  DomainError,
  getOffset,
  makePagination,
  makePaginationResult,
  toDomainError,
} from '../index'

describe('Challenge Domain Models', () => {
  it('decodes a valid TypeScript Challenge', () => {
    const raw = {
      id: 'ch_ts_token_bucket',
      title: 'Debug Token Bucket Limiter',
      description: 'Fix the leaky bucket algorithm.',
      language: 'typescript',
      starterFiles: { 'src/limiter.ts': 'export class RateLimiter {}' },
      testFiles: { 'test/limiter.test.ts': "import { describe } from 'vitest'" },
      timeLimitMinutes: 45,
    }
    const decoded = Schema.decodeUnknownSync(Challenge)(raw)
    expect(decoded.language).toBe('typescript')
    expect(decoded.starterFiles['src/limiter.ts']).toBe('export class RateLimiter {}')
    expect(decoded.testFiles['test/limiter.test.ts']).toBe("import { describe } from 'vitest'")
    expect(decoded.timeLimitMinutes).toBe(45)
    expect(decoded.id).toBe('ch_ts_token_bucket')
  })

  it('decodes a valid Python Challenge', () => {
    const raw = {
      id: 'ch_py_lru_cache',
      title: 'Implement Async Cache',
      description: 'Implement thread-safe TTL cache.',
      language: 'python',
      starterFiles: { 'cache.py': 'class TTLCache:\n    pass' },
      testFiles: { 'test_cache.py': 'import pytest' },
      timeLimitMinutes: 30,
    }
    const decoded = Schema.decodeUnknownSync(Challenge)(raw)
    expect(decoded.language).toBe('python')
    expect(decoded.starterFiles['cache.py']).toBe('class TTLCache:\n    pass')
    expect(decoded.testFiles['test_cache.py']).toBe('import pytest')
    expect(decoded.timeLimitMinutes).toBe(30)
  })

  it('fails decoding on invalid language', () => {
    const raw = {
      id: 'ch_invalid_lang',
      title: 'Invalid Lang Challenge',
      description: 'Desc',
      language: 'rust',
      starterFiles: {},
      testFiles: {},
      timeLimitMinutes: 10,
    }
    expect(() => Schema.decodeUnknownSync(Challenge)(raw)).toThrow()
  })

  describe('DomainError', () => {
    it('creates notFound error with standard props', () => {
      const err = DomainError.notFound({ entity: 'Challenge', id: 'ch_123' })
      expect(err._tag).toBe('DomainError')
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
