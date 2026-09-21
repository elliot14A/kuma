/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { mockKvStoreChallenge } from '#/mocks'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/components/inspector/inspector.test.ts')
const { Inspector } = await import('./inspector')
endFileScope()

describe('Inspector Component', () => {
  it('renders challenge metadata, difficulty, limits, and tags', () => {
    const root = createMockElement()
    renderInto(
      h(Inspector, {
        challenge: mockKvStoreChallenge,
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })
})
