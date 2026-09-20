import { ExecutionStatusEnum, type TestSummary } from '@kuma/domain'
import { Option, Schema } from 'effect'
import { XMLParser } from 'fast-xml-parser'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

const JunitSuiteSchema = Schema.Struct({
  '@_tests': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
  '@_failures': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
  '@_errors': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
})

const JunitDocSchema = Schema.Struct({
  testsuites: Schema.optional(
    Schema.Struct({
      '@_tests': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
      '@_failures': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
      '@_errors': Schema.optional(Schema.Union([Schema.Number, Schema.String])),
      testsuite: Schema.optional(
        Schema.Union([JunitSuiteSchema, Schema.Array(JunitSuiteSchema)]),
      ),
    }),
  ),
  testsuite: Schema.optional(
    Schema.Union([JunitSuiteSchema, Schema.Array(JunitSuiteSchema)]),
  ),
})

type JunitDoc = typeof JunitDocSchema.Type
type JunitSuite = typeof JunitSuiteSchema.Type

const toNumber = (val: string | number | undefined): number => {
  if (val === undefined) return 0
  const num = typeof val === 'number' ? val : Number.parseInt(val, 10)
  return Number.isNaN(num) ? 0 : num
}

export const parseJunitReport = (
  xmlContent: string,
  exitCode: number,
): { status: ExecutionStatusEnum; summary?: TestSummary } => {
  if (!xmlContent || !xmlContent.trim()) {
    return {
      status:
        exitCode === 0 ? ExecutionStatusEnum.Passed : ExecutionStatusEnum.Failed,
    }
  }

  const parseResult = Option.fromNullishOr(xmlParser.parse(xmlContent))
  const decodedOpt = Option.flatMap(parseResult, (parsed) =>
    Schema.decodeUnknownOption(JunitDocSchema)(parsed),
  )

  return Option.match(decodedOpt, {
    onNone: () => ({
      status:
        exitCode === 0 ? ExecutionStatusEnum.Passed : ExecutionStatusEnum.Failed,
    }),
    onSome: (doc: JunitDoc) => {
      let total = 0
      let failures = 0
      let errors = 0
      let foundSuite = false

      const accumulateSuite = (suite: JunitSuite) => {
        if (suite['@_tests'] !== undefined) {
          total += toNumber(suite['@_tests'])
          failures += toNumber(suite['@_failures'])
          errors += toNumber(suite['@_errors'])
          foundSuite = true
        }
      }

      if (doc.testsuites) {
        if (doc.testsuites['@_tests'] !== undefined) {
          total = toNumber(doc.testsuites['@_tests'])
          failures = toNumber(doc.testsuites['@_failures'])
          errors = toNumber(doc.testsuites['@_errors'])
          foundSuite = true
        } else if (doc.testsuites.testsuite) {
          const suites = Array.isArray(doc.testsuites.testsuite)
            ? doc.testsuites.testsuite
            : [doc.testsuites.testsuite]
          for (const suite of suites) {
            accumulateSuite(suite)
          }
        }
      } else if (doc.testsuite) {
        const suites = Array.isArray(doc.testsuite)
          ? doc.testsuite
          : [doc.testsuite]
        for (const suite of suites) {
          accumulateSuite(suite)
        }
      }

      if (foundSuite && total > 0) {
        const totalFailed = failures + errors
        const passed = Math.max(0, total - totalFailed)
        return {
          status:
            exitCode === 0 && totalFailed === 0
              ? ExecutionStatusEnum.Passed
              : ExecutionStatusEnum.Failed,
          summary: {
            passed,
            failed: totalFailed,
            total,
          },
        }
      }

      return {
        status:
          exitCode === 0 ? ExecutionStatusEnum.Passed : ExecutionStatusEnum.Failed,
      }
    },
  })
}
