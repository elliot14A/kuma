import { DomainError, type ExecutionResult, ExecutionStatusEnum, type FileMap } from '@kuma/domain'
import { Duration, Effect, Layer, Option } from 'effect'
import { parseJunitReport } from '../parsers'
import { type SandboxExecutionPayload, SandboxRunner, type SandboxRunnerShape } from '../runner'

const MAX_OUTPUT_CHARS = 512 * 1024

const truncate = (str: string): string =>
  str.length > MAX_OUTPUT_CHARS ? `${str.slice(0, MAX_OUTPUT_CHARS)}\n... [output truncated]` : str

const validateFilePath = (relPath: string) => {
  const normalized = relPath.replace(/\\/g, '/').trim()
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    normalized === '..' ||
    normalized.includes('\0')
  ) {
    return Option.none<string>()
  }
  return Option.some(normalized)
}

const makeWorkspace = (runId: string, files: FileMap) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const tempDir = `/tmp/kuma-run-${runId}`

      for (const [relPath, content] of Object.entries(files)) {
        const validPathOpt = validateFilePath(relPath)
        if (Option.isNone(validPathOpt)) {
          return yield* Effect.fail(
            DomainError.invalidInput({
              message: `invalid file path '${relPath}': path traversal not permitted`,
              op: 'sandbox.workspace.create',
            }),
          )
        }

        const safeRelPath = validPathOpt.value
        const fullPath = `${tempDir}/${safeRelPath}`
        const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))

        yield* Effect.tryPromise({
          try: async () => {
            if (dir && dir !== tempDir) {
              await Bun.spawn(['mkdir', '-p', dir]).exited
            } else {
              await Bun.spawn(['mkdir', '-p', tempDir]).exited
            }
            await Bun.write(fullPath, content)
          },
          catch: (cause) =>
            DomainError.internal({
              message: 'failed to write sandbox file',
              op: 'sandbox.workspace.create',
              cause,
            }),
        })
      }

      yield* Effect.tryPromise({
        try: async () => {
          await Bun.spawn(['chmod', '-R', '777', tempDir]).exited
        },
        catch: (cause) =>
          DomainError.internal({
            message: 'failed to set sandbox workspace permissions',
            op: 'sandbox.workspace.create',
            cause,
          }),
      })

      return tempDir
    }),
    (tempDir) =>
      Effect.tryPromise({
        try: async () => {
          await Bun.spawn(['rm', '-rf', tempDir]).exited
        },
        catch: (cause) =>
          DomainError.internal({
            message: 'failed to cleanup sandbox workspace',
            op: 'sandbox.workspace.cleanup',
            cause,
          }),
      }).pipe(Effect.orDie),
  )

const executeDockerContainer = (containerName: string, cmd: string[]) =>
  Effect.acquireUseRelease(
    Effect.sync(() => Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' })),
    (proc) =>
      Effect.tryPromise({
        try: async () => {
          const stdout = await new Response(proc.stdout).text()
          const stderr = await new Response(proc.stderr).text()
          const exitCode = await proc.exited
          return {
            stdout: truncate(stdout),
            stderr: truncate(stderr),
            exitCode,
          }
        },
        catch: (cause) =>
          DomainError.internal({
            message: 'docker sandbox container execution failed',
            op: 'sandbox.docker.execute',
            cause,
          }),
      }),
    (proc) =>
      Effect.tryPromise(async () => {
        proc.kill(9)
        await Bun.spawn(['docker', 'rm', '-f', containerName], {
          stdout: 'ignore',
          stderr: 'ignore',
        }).exited
      }).pipe(Effect.orDie),
  )

const runInWorkspace = (runId: string, tempDir: string, payload: SandboxExecutionPayload) =>
  Effect.gen(function* () {
    const startTime = Date.now()
    const containerName = `kuma-exec-${runId}`

    const baseDockerArgs = [
      'docker',
      'run',
      '--name',
      containerName,
      '--rm',
      '--network',
      'none',
      '--memory',
      '512m',
      '--memory-swap',
      '512m',
      '--cpus',
      '1.0',
      '--pids-limit',
      '64',
      '--security-opt',
      'no-new-privileges',
      '--cap-drop',
      'ALL',
      '--ulimit',
      'nofile=256:512',
      '--ulimit',
      'fsize=10485760',
      '--tmpfs',
      '/tmp:rw,nosuid,size=64m',
      '-v',
      `${tempDir}:/app`,
      '-w',
      '/app',
    ]

    const cmd =
      payload.language === 'typescript'
        ? [
            ...baseDockerArgs,
            'kuma-runner-ts:latest',
            'bun',
            'test',
            '--reporter=junit',
            '--reporter-outfile=report.xml',
          ]
        : [...baseDockerArgs, 'kuma-runner-py:latest', 'pytest', '--junitxml=report.xml']

    const timeoutSeconds = payload.timeoutSeconds ?? 30
    const maybeExecution = yield* executeDockerContainer(containerName, cmd).pipe(
      Effect.timeoutOption(Duration.seconds(timeoutSeconds)),
    )

    const durationMs = Date.now() - startTime

    return yield* Option.match(maybeExecution, {
      onNone: () =>
        Effect.succeed<ExecutionResult>({
          status: ExecutionStatusEnum.Timeout,
          exitCode: 124,
          stdout: '',
          stderr: `execution timed out after ${timeoutSeconds}s`,
          durationMs,
        }),
      onSome: ({ stdout, stderr, exitCode }) =>
        Effect.gen(function* () {
          const reportFile = Bun.file(`${tempDir}/report.xml`)
          const exists = yield* Effect.promise(() => reportFile.exists())
          const reportXml = exists ? yield* Effect.promise(() => reportFile.text()) : ''

          const parsed = parseJunitReport(reportXml, exitCode)
          const result: ExecutionResult = {
            status: parsed.status,
            exitCode,
            stdout,
            stderr,
            durationMs,
            ...(parsed.summary ? { summary: parsed.summary } : {}),
          }
          return result
        }),
    })
  })

export const makeLocalDockerRunner = (): Effect.Effect<SandboxRunnerShape> =>
  Effect.succeed({
    execute: (payload: SandboxExecutionPayload) =>
      Effect.scoped(
        Effect.gen(function* () {
          const runId = crypto.randomUUID()
          const tempDir = yield* makeWorkspace(runId, payload.files)
          return yield* runInWorkspace(runId, tempDir, payload)
        }),
      ),
  })

export const LocalDockerRunner = Layer.effect(SandboxRunner, makeLocalDockerRunner())
