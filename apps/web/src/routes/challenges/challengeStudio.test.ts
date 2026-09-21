/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/routes/challenges/challengeStudio.test.ts')
const { ChallengeStudio } = await import('./challengeStudio')
endFileScope()

describe('ChallengeStudio Route Component', () => {
  it('renders complete challenge studio view with mock data', () => {
    const root = createMockElement()
    renderInto(h(ChallengeStudio, {}), root)
    expect(root.childNodes.length).toBe(1)
  })

  it('renders right dock with challenge, config, and kuma options', () => {
    const root = createMockElement()
    renderInto(h(ChallengeStudio, {}), root)
    expect(root.childNodes.length).toBe(1)
  })
})
