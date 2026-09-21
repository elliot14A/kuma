import {
  DomainError,
  type FileMap,
  KumaApi,
} from '@kuma/domain'
import { SandboxRunner } from '@kuma/infra'
import * as assessments from '@postgres/assessments'
import * as challenges from '@postgres/challenges'
import { Effect } from 'effect'
import { HttpApiBuilder } from 'effect/unstable/httpapi'

export const ExecutionsHandlers = HttpApiBuilder.group(KumaApi, 'executions', (handlers) =>
  handlers.handle('execute', ({ params, payload }) =>
    Effect.gen(function* () {
      const assessment = yield* assessments.fetch(params.id)

      const isAssigned = assessment.challengeIds.includes(payload.challengeId)
      if (!isAssigned) {
        return yield* Effect.fail(
          DomainError.conflict({
            message: `challenge '${payload.challengeId}' is not assigned to assessment '${params.id}'`,
            op: 'assessments.execute',
          }),
        )
      }

      const challenge = yield* challenges.fetch(payload.challengeId)

      const candidateFiles =
        payload.candidateFiles ?? assessment.metadata.candidateFiles[payload.challengeId] ?? {}
      const mergedFiles: FileMap = {
        ...challenge.metadata.starterFiles,
        ...candidateFiles,
        ...challenge.metadata.testFiles,
      }

      const runner = yield* SandboxRunner
      return yield* runner.execute({
        language: challenge.language,
        files: mergedFiles,
        timeoutSeconds:
          payload.timeoutSeconds ??
          (challenge.timeLimitMinutes > 0 ? challenge.timeLimitMinutes * 60 : undefined),
      })
    }),
  ),
)
