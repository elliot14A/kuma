import { ExecutionStatusEnum } from '@kuma/domain'
import { describe, expect, it } from 'vitest'
import { parseJunitReport } from './junit'

describe('JUnit Report Parser', () => {
  it('parses valid Bun JUnit XML report with all tests passing', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test">
  <testsuite name="solution.test.ts" tests="4" failures="0" errors="0" time="0.012">
    <testcase name="passes test 1" time="0.002"/>
    <testcase name="passes test 2" time="0.001"/>
    <testcase name="passes test 3" time="0.001"/>
    <testcase name="passes test 4" time="0.001"/>
  </testsuite>
</testsuites>`

    const result = parseJunitReport(xml, 0)
    expect(result.status).toBe(ExecutionStatusEnum.Passed)
    expect(result.summary).toEqual({ passed: 4, failed: 0, total: 4 })
  })

  it('parses valid Pytest JUnit XML report with failures', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<testsuite name="pytest" errors="0" failures="1" skipped="0" tests="3" time="0.05">
  <testcase classname="test_solution" name="test_one" time="0.001"/>
  <testcase classname="test_solution" name="test_two" time="0.001">
    <failure message="assert 1 == 2">def test_two(): assert 1 == 2</failure>
  </testcase>
  <testcase classname="test_solution" name="test_three" time="0.001"/>
</testsuite>`

    const result = parseJunitReport(xml, 1)
    expect(result.status).toBe(ExecutionStatusEnum.Failed)
    expect(result.summary).toEqual({ passed: 2, failed: 1, total: 3 })
  })

  it('handles empty or malformed XML gracefully using exit code', () => {
    const emptyResult = parseJunitReport('', 1)
    expect(emptyResult.status).toBe(ExecutionStatusEnum.Failed)
    expect(emptyResult.summary).toBeUndefined()

    const malformedResult = parseJunitReport('invalid xml content', 0)
    expect(malformedResult.status).toBe(ExecutionStatusEnum.Passed)
    expect(malformedResult.summary).toBeUndefined()
  })
})
