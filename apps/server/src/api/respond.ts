import { type ErrorCode, isDomainError, toDomainError } from '@kuma/domain'
import { Effect } from 'effect'
import { HttpServerResponse } from 'effect/unstable/http'

export interface ErrorResponse {
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
  readonly op?: string | undefined
  readonly headers?: Record<string, string> | undefined
}

const isErrorLike = (u: unknown): boolean =>
  isDomainError(u) ||
  u instanceof Error ||
  (typeof u === 'object' &&
    u !== null &&
    '_tag' in u &&
    typeof (u as { _tag: unknown })._tag === 'string' &&
    (u as { _tag: string })._tag.toLowerCase().includes('error'))

export const response = <T>(data?: T | unknown, options?: ResponseOptions) => {
  if (isErrorLike(data)) {
    const domErr = isDomainError(data) ? data : toDomainError(data, options?.op)
    const status = options?.status ?? StatusCodeMap[domErr.code] ?? 500
    const operation = domErr.op ?? options?.op

    return HttpServerResponse.json(
      {
        code: domErr.code,
        message: domErr.message,
        ...(operation ? { op: operation } : {}),
      },
      {
        status,
        headers: options?.headers,
      },
    )
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

  return HttpServerResponse.json(data, {
    status,
    headers: options?.headers,
  })
}
