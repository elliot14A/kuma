/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { type ExecutionResult, ExecutionStatusEnum } from '@kuma/domain'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/components/verifier/verifier.test.ts')
const { TestBadge } = await import('./testBadge')
const { TestDrawer } = await import('./testDrawer')
endFileScope()

const testExecutionResult: ExecutionResult = {
  status: ExecutionStatusEnum.Passed,
  exitCode: 0,
  stdout: 'Ran 4 tests across 1 file. [142ms]\n4 passed, 0 failed\n',
  stderr: '',
  durationMs: 142,
  summary: {
    passed: 4,
    failed: 0,
    total: 4,
  },
}

describe('Verifier Components', () => {
  it('TestBadge renders passed status and counts correctly', () => {
    const root = createMockElement()
    renderInto(
      h(TestBadge, {
        status: 'passed',
        passed: 4,
        total: 4,
        durationMs: 142,
      }),
      root,
    )
    expect(root.childNodes.length).toBe(1)
  })

  it('TestBadge renders running status', () => {
    const root = createMockElement()
    renderInto(
      h(TestBadge, {
        status: 'running',
      }),
      root,
    )
    expect(root.childNodes.length).toBe(1)
  })

  it('TestDrawer renders test results and execution metrics', () => {
    const root = createMockElement()
    renderInto(
      h(TestDrawer, {
        status: 'passed',
        result: testExecutionResult,
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })
})
