import { describe, expect, it } from 'vitest'
import { parseCliArgs } from './cli'

describe('Kuma CLI Parser', () => {
  it('parses migrate command', () => {
    const result = parseCliArgs(['migrate'])
    expect(result.command.type).toBe('migrate')
  })

  it('parses server command', () => {
    const result = parseCliArgs(['server'])
    expect(result.command.type).toBe('server')
  })

  it('parses web command', () => {
    const result = parseCliArgs(['web'])
    expect(result.command.type).toBe('web')
  })

  it('parses help and version flags', () => {
    expect(parseCliArgs(['--help']).command.type).toBe('help')
    expect(parseCliArgs(['-h']).command.type).toBe('help')
    expect(parseCliArgs(['--version']).command.type).toBe('version')
    expect(parseCliArgs(['-v']).command.type).toBe('version')
  })

  it('defaults to help for unknown arguments', () => {
    const result = parseCliArgs(['unknown_cmd'])
    expect(result.command.type).toBe('help')
  })
})
