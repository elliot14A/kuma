import { Effect, Exit, Layer } from 'effect'
import { describe, expect, it } from 'vitest'
import { AppLogger, httpLogger, jsonLogger, prettyLogger, textLogger } from './index'

describe('Logger module', () => {
  it('exposes standard Effect httpLogger middleware', () => {
    expect(httpLogger).toBeDefined()
    expect(typeof httpLogger).toBe('function')
  })

  it('provides standard Effect log formatters and AppLogger layer', async () => {
    expect(textLogger).toBeDefined()
    expect(jsonLogger).toBeDefined()
    expect(prettyLogger).toBeDefined()
    expect(AppLogger).toBeDefined()

    expect(Layer.isLayer(textLogger)).toBe(true)
    expect(Layer.isLayer(jsonLogger)).toBe(true)
    expect(Layer.isLayer(prettyLogger)).toBe(true)
    expect(Layer.isLayer(AppLogger)).toBe(true)

    const program = Effect.log('Logger test message').pipe(
      Effect.annotateLogs({ key: 'value' }),
      Effect.provide(AppLogger),
    )
    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isSuccess(exit)).toBe(true)
  })
})
