import { Data } from 'effect'

export type ErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'INVALID_INPUT'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'

export interface DomainErrorProps {
  readonly code: ErrorCode
  readonly message: string
  readonly op?: string | undefined
  readonly entity?: string | undefined
  readonly id?: string | undefined
  readonly cause?: unknown | undefined
}

export class DomainError extends Data.TaggedError('DomainError')<DomainErrorProps> {
  static notFound(props: {
    readonly entity: string
    readonly id: string
    readonly message?: string | undefined
    readonly op?: string | undefined
  }): DomainError {
    return new DomainError({
      code: 'NOT_FOUND',
      entity: props.entity,
      id: props.id,
      message: props.message ?? `${props.entity} with id '${props.id}' not found`,
      op: props.op,
    })
  }

  static invalidInput(props: {
    readonly message: string
    readonly op?: string | undefined
    readonly cause?: unknown | undefined
  }): DomainError {
    return new DomainError({
      code: 'INVALID_INPUT',
      message: props.message,
      op: props.op,
      cause: props.cause,
    })
  }

  static alreadyExists(props: {
    readonly entity: string
    readonly id: string
    readonly message?: string | undefined
    readonly op?: string | undefined
  }): DomainError {
    return new DomainError({
      code: 'ALREADY_EXISTS',
      entity: props.entity,
      id: props.id,
      message: props.message ?? `${props.entity} with id '${props.id}' already exists`,
      op: props.op,
    })
  }

  static conflict(props: {
    readonly message: string
    readonly op?: string | undefined
    readonly cause?: unknown | undefined
  }): DomainError {
    return new DomainError({
      code: 'CONFLICT',
      message: props.message,
      op: props.op,
      cause: props.cause,
    })
  }

  static rateLimit(props: {
    readonly message: string
    readonly op?: string | undefined
  }): DomainError {
    return new DomainError({
      code: 'RATE_LIMIT_EXCEEDED',
      message: props.message,
      op: props.op,
    })
  }

  static unauthenticated(props: {
    readonly message: string
    readonly op?: string | undefined
  }): DomainError {
    return new DomainError({
      code: 'UNAUTHENTICATED',
      message: props.message,
      op: props.op,
    })
  }

  static unauthorized(props: {
    readonly message: string
    readonly op?: string | undefined
  }): DomainError {
    return new DomainError({
      code: 'UNAUTHORIZED',
      message: props.message,
      op: props.op,
    })
  }

  static internal(props: {
    readonly message: string
    readonly op?: string | undefined
    readonly cause?: unknown | undefined
  }): DomainError {
    return new DomainError({
      code: 'INTERNAL',
      message: props.message,
      op: props.op,
      cause: props.cause,
    })
  }
}

export const isDomainError = (u: unknown): u is DomainError =>
  u instanceof DomainError ||
  (typeof u === 'object' &&
    u !== null &&
    '_tag' in u &&
    (u as { _tag: string })._tag === 'DomainError')

export const toDomainError = (u: unknown, op?: string): DomainError => {
  if (isDomainError(u)) {
    return u
  }
  if (
    typeof u === 'object' &&
    u !== null &&
    'toDomainError' in u &&
    typeof (u as { toDomainError: (op?: string) => DomainError }).toDomainError === 'function'
  ) {
    return (u as { toDomainError: (op?: string) => DomainError }).toDomainError(op)
  }
  const message = u instanceof Error ? u.message : String(u)
  return DomainError.internal({ message, op, cause: u })
}
