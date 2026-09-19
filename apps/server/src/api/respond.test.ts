import { DomainError } from '@kuma/domain'
import { Data, Effect } from 'effect'
import { HttpServerResponse } from 'effect/unstable/http'
import { describe, expect, it } from 'vitest'
import { response } from './respond'

class TaggedPayload extends Data.TaggedClass('CustomPayload')<{
  readonly name: string
  readonly count: number
}> {}

describe('API response helper', () => {
  it('returns 200 with JSON body for standard objects', async () => {
    const resEffect = response({ hello: 'world' })
    const httpRes = await Effect.runPromise(resEffect)
    expect(httpRes.status).toBe(200)
    const webRes = await HttpServerResponse.toWeb(httpRes)
    const json = (await webRes.json()) as { hello: string }
    expect(json.hello).toBe('world')
  })

  it('does NOT misclassify tagged data objects as errors', async () => {
    const tagged = new TaggedPayload({ name: 'kuma', count: 42 })
    const resEffect = response(tagged)
    const httpRes = await Effect.runPromise(resEffect)
    expect(httpRes.status).toBe(200)
    const webRes = await HttpServerResponse.toWeb(httpRes)
    const json = (await webRes.json()) as { _tag: string; name: string; count: number }
    expect(json._tag).toBe('CustomPayload')
    expect(json.name).toBe('kuma')
    expect(json.count).toBe(42)
  })

  it('handles DomainError correctly with mapped status code', async () => {
    const err = DomainError.notFound({
      entity: 'Resource',
      id: '123',
      message: 'Resource not found',
      op: 'test.fetch',
    })
    const resEffect = response(err)
    const httpRes = await Effect.runPromise(resEffect)
    expect(httpRes.status).toBe(404)
    const webRes = await HttpServerResponse.toWeb(httpRes)
    const json = (await webRes.json()) as { code: string; message: string; op?: string }
    expect(json.code).toBe('NOT_FOUND')
    expect(json.message).toBe('Resource not found')
    expect(json.op).toBe('test.fetch')
  })

  it('handles native Error objects as 500 INTERNAL', async () => {
    const err = new Error('Unexpected crash')
    const resEffect = response(err, { op: 'test.crash' })
    const httpRes = await Effect.runPromise(resEffect)
    expect(httpRes.status).toBe(500)
    const webRes = await HttpServerResponse.toWeb(httpRes)
    const json = (await webRes.json()) as { code: string; message: string; op?: string }
    expect(json.code).toBe('INTERNAL')
    expect(json.message).toBe('Unexpected crash')
    expect(json.op).toBe('test.crash')
  })

  it('returns 204 No Content for undefined or status 204', async () => {
    const resEffect = response(undefined)
    const httpRes = await Effect.runPromise(resEffect)
    expect(httpRes.status).toBe(204)
  })
})
