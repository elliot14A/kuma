import { DomainError } from '@kuma/domain'
import { Data } from 'effect'

export const PostgresSqlState = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const

const extractSqlCode = (cause: unknown): string | undefined => {
  if (typeof cause !== 'object' || cause === null) return undefined
  const obj = cause as Record<string, unknown>
  if (typeof obj.code === 'string') return obj.code
  if (typeof obj.cause === 'object' && obj.cause !== null) {
    return extractSqlCode(obj.cause)
  }
  return undefined
}

export class PostgresError extends Data.TaggedError('PostgresError')<{
  readonly cause: unknown
  readonly query?: string | undefined
  readonly op?: string | undefined
}> {
  toDomainError(op?: string): DomainError {
    const operation = this.op ?? op ?? (this.query ? `postgres.${this.query}` : 'postgres.query')
    const code = extractSqlCode(this.cause)

    if (code === PostgresSqlState.UNIQUE_VIOLATION) {
      return DomainError.alreadyExists({
        entity: 'Record',
        id: '',
        message: 'A record with this identifier already exists',
        op: operation,
      })
    }

    if (code === PostgresSqlState.FOREIGN_KEY_VIOLATION) {
      return DomainError.conflict({
        message: 'Operation failed due to relational dependency constraint',
        op: operation,
        cause: this.cause,
      })
    }

    if (code === PostgresSqlState.NOT_NULL_VIOLATION || code === PostgresSqlState.CHECK_VIOLATION) {
      return DomainError.invalidInput({
        message: 'Database constraint validation failed',
        op: operation,
        cause: this.cause,
      })
    }

    const errStr =
      this.cause instanceof Error
        ? this.cause.message.toLowerCase()
        : String(this.cause).toLowerCase()

    if (errStr.includes('unique constraint') || errStr.includes('duplicate key')) {
      return DomainError.alreadyExists({
        entity: 'Record',
        id: '',
        message: 'A record with this identifier already exists',
        op: operation,
      })
    }

    if (errStr.includes('foreign key')) {
      return DomainError.conflict({
        message: 'Operation failed due to relational dependency constraint',
        op: operation,
        cause: this.cause,
      })
    }

    return DomainError.internal({
      message: 'Database operation failed',
      op: operation,
      cause: this.cause,
    })
  }
}

export const mapPostgresError = (cause: unknown, query?: string, op?: string): DomainError =>
  new PostgresError({ cause, query, op }).toDomainError(op)
