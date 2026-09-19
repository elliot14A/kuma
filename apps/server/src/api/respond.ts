import { type ErrorCode, isDomainError, toDomainError } from '@kuma/domain'
import { Effect, Predicate } from 'effect'
import { HttpServerResponse } from 'effect/unstable/http'

export interface Response<T = unknown> {
  readonly status: 'success'
  readonly message: string
  readonly data: T
}

export interface ErrorResponse {
  readonly status: 'error'
  readonly code: ErrorCode
  readonly message: string
  readonly op?: string | undefined
}

const StatusCodeMap: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  INVALID_INPUT: 400,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 403,
  INTERNAL: 500,
}

export interface ResponseOptions {
  readonly status?: number | undefined
  readonly message?: string | undefined
  readonly op?: string | undefined
  readonly headers?: Record<string, string> | undefined
}

const isErrorLike = (u: unknown): boolean =>
  isDomainError(u) ||
  u instanceof Error ||
  Predicate.hasProperty(u, 'toDomainError') ||
  Predicate.isTagged(u, 'SchemaError') ||
  Predicate.isTagged(u, 'ParseError') ||
  Predicate.isTagged(u, 'RequestError') ||
  Predicate.isTagged(u, 'HttpServerError')

export const response = <T>(data?: T | unknown, options?: ResponseOptions) => {
  if (isErrorLike(data)) {
    const domErr = isDomainError(data) ? data : toDomainError(data, options?.op)
    const status = options?.status ?? StatusCodeMap[domErr.code] ?? 500
    const operation = domErr.op ?? options?.op

    const body: ErrorResponse = {
      status: 'error',
      code: domErr.code,
      message: domErr.message,
      ...(operation ? { op: operation } : {}),
    }

    return HttpServerResponse.json(body, {
      status,
      headers: options?.headers,
    })
  }

  const status = options?.status ?? (data === undefined ? 204 : 200)

  if (data === undefined || status === 204) {
    return Effect.succeed(
      HttpServerResponse.empty({
        status: 204,
        headers: options?.headers,
      }),
    )
  }

  const body: Response<T> = {
    status: 'success',
    message: options?.message ?? (status === 201 ? 'created successfully' : 'success'),
    data: data as T,
  }

  return HttpServerResponse.json(body, {
    status,
    headers: options?.headers,
  })
}
