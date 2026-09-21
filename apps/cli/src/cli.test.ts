import { BunServices } from '@effect/platform-bun'
import { AppLogger } from '@kuma/infra'
import { Effect, Exit } from 'effect'
import { describe, expect, it } from 'vitest'
import { rootCommand, runCli } from './cli'

describe('Kuma CLI (effect/unstable/cli)', () => {
  it('defines rootCommand with expected subcommands', () => {
    expect(rootCommand.name).toBe('kuma')
    const commands = rootCommand.subcommands.flatMap((g) => g.commands)
    expect(commands.length).toBe(3)
    const subcommandNames = commands.map((c) => c.name)
    expect(subcommandNames).toContain('migrate')
    expect(subcommandNames).toContain('server')
    expect(subcommandNames).toContain('web')
  })

  it('executes web command successfully', async () => {
    const program = runCli(['web']).pipe(
      Effect.provide(AppLogger),
      Effect.provide(BunServices.layer),
    )
    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isSuccess(exit)).toBe(true)
  })

  it('fails with help for unknown subcommands', async () => {
    const program = runCli(['unknown-command']).pipe(
      Effect.provide(AppLogger),
      Effect.provide(BunServices.layer),
    )
    const exit = await Effect.runPromiseExit(program)
    expect(Exit.isFailure(exit)).toBe(true)
  })
})
