import {
  type Challenge,
  type ChallengeId,
  type ExecutionResult,
  ExecutionStatusEnum,
} from '@kuma/domain'

export const mockSpecMarkdown = `# In-Memory Key-Value Store with TTL

## Overview
Implement an in-memory Key-Value store in TypeScript with support for time-to-live (TTL) expiration, passive expiration on access, and active background eviction.

## Function Description
Complete the \`InMemoryKVStore\` class implementing the \`KVStore\` interface:

- \`set(key: string, value: unknown, ttlMs?: number): void\`
  Stores a value associated with the given key. If \`ttlMs\` is provided, sets an expiration timestamp.
- \`get<T>(key: string): T | undefined\`
  Returns the stored value or \`undefined\` if not found or expired.
- \`delete(key: string): boolean\`
  Removes a key and returns true if deleted.
- \`cleanupExpired(): number\`
  Scans all keys and evicts expired entries, returning the total count of evicted keys.

## Constraints
- \`1 <= key.length <= 256\`
- \`0 <= ttlMs <= 86400000\` (max 24 hours)
- Time Limit: **60 Minutes**

## Examples

### Example 1: Basic Storage and Retrieval
\`\`\`ts
const store = new InMemoryKVStore()
store.set('user:101', { name: 'Alice' })
store.get('user:101') // returns { name: 'Alice' }
store.size() // returns 1
\`\`\`

### Example 2: TTL Expiration
\`\`\`ts
store.set('token', 'xyz', 100) // expires in 100ms
await sleep(150)
store.get('token') // returns undefined (passively purged)
\`\`\`

### Example 3: Active Cleanup
\`\`\`ts
store.set('temp:1', 'val', 50)
store.set('temp:2', 'val', 50)
await sleep(60)
const evicted = store.cleanupExpired() // returns 2
\`\`\`
`

export const mockKvStoreChallenge: Challenge = {
  id: 'ch_kv_store_ttl' as ChallengeId,
  title: 'In-Memory Key-Value Store with TTL',
  description:
    'Design and implement an in-memory key-value store with time-to-live expiration and periodic active eviction.',
  language: 'typescript',
  timeLimitMinutes: 60,
  metadata: {
    specMarkdown: mockSpecMarkdown,
    starterFiles: {
      'src/kv_store.ts': `import type { KVStore, StoreEntry } from './types'

export class InMemoryKVStore implements KVStore {
  private readonly store = new Map<string, StoreEntry>()

  set(key: string, value: unknown, ttlMs?: number): void {
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : undefined
    this.store.set(key, { value, expiresAt })
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) {
      return undefined
    }

    if (entry.expiresAt !== undefined && Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }

  cleanupExpired(): number {
    const now = Date.now()
    let evicted = 0

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== undefined && now >= entry.expiresAt) {
        this.store.delete(key)
        evicted++
      }
    }

    return evicted
  }
}
`,
      'src/types.ts': `export interface StoreEntry {
  readonly value: unknown
  readonly expiresAt?: number
}

export interface KVStore {
  set(key: string, value: unknown, ttlMs?: number): void
  get<T = unknown>(key: string): T | undefined
  delete(key: string): boolean
  clear(): void
  size(): number
  cleanupExpired(): number
}
`,
    },
    testFiles: {
      'tests/kv_store.test.ts': `import { describe, expect, it } from 'bun:test'
import { InMemoryKVStore } from '../src/kv_store'

describe('InMemoryKVStore', () => {
  it('should store and retrieve basic keys', () => {
    const store = new InMemoryKVStore()
    store.set('user:101', { name: 'Alice', role: 'admin' })
    expect(store.get('user:101')).toEqual({ name: 'Alice', role: 'admin' })
    expect(store.size()).toBe(1)
  })

  it('should expire keys passively after TTL has elapsed', async () => {
    const store = new InMemoryKVStore()
    store.set('session:token', 'xyz987', 50)
    expect(store.get('session:token')).toBe('xyz987')

    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(store.get('session:token')).toBeUndefined()
  })

  it('should purge expired keys actively with cleanupExpired', async () => {
    const store = new InMemoryKVStore()
    store.set('temp:1', 'a', 30)
    store.set('temp:2', 'b', 30)
    store.set('perm:1', 'c')

    await new Promise((resolve) => setTimeout(resolve, 40))
    const evicted = store.cleanupExpired()
    expect(evicted).toBe(2)
    expect(store.size()).toBe(1)
  })

  it('should handle deletion and clearing of all records', () => {
    const store = new InMemoryKVStore()
    store.set('k1', 1)
    store.set('k2', 2)
    expect(store.delete('k1')).toBe(true)
    expect(store.get('k1')).toBeUndefined()
    store.clear()
    expect(store.size()).toBe(0)
  })
})
`,
    },
  },
  createdAt: new Date('2026-09-20T12:00:00.000Z'),
  updatedAt: new Date('2026-09-20T12:00:00.000Z'),
}

export const mockExecutionResult: ExecutionResult = {
  status: ExecutionStatusEnum.Passed,
  exitCode: 0,
  durationMs: 142,
  summary: {
    total: 4,
    passed: 4,
    failed: 0,
  },
  stdout: `bun test v1.2.4 (x86_64-linux)
tests/kv_store.test.ts:
✓ InMemoryKVStore > should store and retrieve basic keys [2.00ms]
✓ InMemoryKVStore > should expire keys passively after TTL has elapsed [52.00ms]
✓ InMemoryKVStore > should purge expired keys actively with cleanupExpired [44.00ms]
✓ InMemoryKVStore > should handle deletion and clearing of all records [1.00ms]

 4 pass
 0 fail
 8 expect() calls
Ran 4 tests across 1 files. [142.00ms]
`,
  stderr: '',
}
