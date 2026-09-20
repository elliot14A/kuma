import { LogConfig } from '@kuma/domain'
import { Effect, Layer, Logger } from 'effect'
import { HttpMiddleware } from 'effect/unstable/http'

export const httpLogger = HttpMiddleware.logger

export const textLogger = Logger.layer([Logger.consoleLogFmt])
export const jsonLogger = Logger.layer([Logger.consoleJson])
export const prettyLogger = Logger.layer([Logger.consolePretty()])

export const AppLogger = Layer.unwrap(
  Effect.gen(function* () {
    const format = yield* LogConfig.format
    if (format === 'json') {
      return jsonLogger
    }
    if (format === 'pretty') {
      return prettyLogger
    }
    return textLogger
  }),
)

export const debug = (message: string, annotations?: Record<string, unknown>) =>
  annotations
    ? Effect.annotateLogs(annotations)(Effect.logDebug(message))
    : Effect.logDebug(message)

export const info = (message: string, annotations?: Record<string, unknown>) =>
  annotations ? Effect.annotateLogs(annotations)(Effect.logInfo(message)) : Effect.logInfo(message)

export const warn = (message: string, annotations?: Record<string, unknown>) =>
  annotations
    ? Effect.annotateLogs(annotations)(Effect.logWarning(message))
    : Effect.logWarning(message)

export const error = (message: string, annotations?: Record<string, unknown>) =>
  annotations
    ? Effect.annotateLogs(annotations)(Effect.logError(message))
    : Effect.logError(message)
