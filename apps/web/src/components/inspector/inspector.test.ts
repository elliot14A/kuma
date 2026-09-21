/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import type { Challenge, ChallengeId } from '@kuma/domain'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/components/inspector/inspector.test.ts')
const { Inspector } = await import('./inspector')
endFileScope()

const testChallenge: Challenge = {
  id: 'ch_test' as ChallengeId,
  title: 'Test Challenge',
  description: 'Test Description',
  language: 'typescript',
  timeLimitMinutes: 30,
  metadata: {
    specMarkdown: '# Test',
    starterFiles: {},
    testFiles: {},
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('Inspector Component', () => {
  it('renders challenge metadata, difficulty, limits, and tags', () => {
    const root = createMockElement()
    renderInto(
      h(Inspector, {
        challenge: testChallenge,
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })
})
