import { Predicate, Schema } from 'effect'

export const ErrorCodeSchema = Schema.Literals([
  'NOT_FOUND',
  'ALREADY_EXISTS',
  'INVALID_INPUT',
  'CONFLICT',
  'INTERNAL',
  'RATE_LIMIT_EXCEEDED',
  'UNAUTHENTICATED',
  'UNAUTHORIZED',
])

export type ErrorCode = typeof ErrorCodeSchema.Type

export interface DomainErrorProps {
  readonly code: ErrorCode
  readonly message: string
  readonly op?: string | undefined
  readonly entity?: string | undefined
  readonly id?: string | undefined
  readonly cause?: unknown | undefined
}

export class DomainError extends Schema.TaggedError<DomainError>()('DomainError', {
  code: ErrorCodeSchema,
  message: Schema.String,
  op: Schema.optional(Schema.String),
  entity: Schema.optional(Schema.String),
  id: Schema.optional(Schema.String),
}) {
  override readonly cause?: unknown | undefined

  constructor(props: DomainErrorProps) {
    super({
      code: props.code,
      message: props.message,
      op: props.op,
      entity: props.entity,
      id: props.id,
    })
    this.cause = props.cause
  }

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
  u instanceof DomainError || Predicate.isTagged(u, 'DomainError')

export const toDomainError = (u: unknown, op?: string): DomainError => {
  if (isDomainError(u)) {
    return u
  }
  if (Predicate.hasProperty(u, 'toDomainError') && typeof u.toDomainError === 'function') {
    return (u as { toDomainError: (op?: string) => DomainError }).toDomainError(op)
  }
  if (
    Predicate.isTagged(u, 'SchemaError') ||
    Predicate.isTagged(u, 'ParseError') ||
    Predicate.isTagged(u, 'RequestError') ||
    Predicate.isTagged(u, 'HttpServerError')
  ) {
    const message = u instanceof Error ? u.message : String(u)
    return DomainError.invalidInput({ message, op, cause: u })
  }
  const message = u instanceof Error ? u.message : String(u)
  return DomainError.internal({ message, op, cause: u })
}
