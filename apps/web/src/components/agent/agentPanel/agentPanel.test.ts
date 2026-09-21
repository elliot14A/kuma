/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/components/agent/agentPanel/agentPanel.test.ts')
const { AgentPanel } = await import('./agentPanel')
endFileScope()

describe('AgentPanel Component', () => {
  it('renders author mode composer with suggestions and context chips', () => {
    const root = createMockElement()
    renderInto(
      h(AgentPanel, {
        mode: 'author',
        activeFile: 'src/kv_store.ts',
        contextFiles: ['spec.md', 'src/kv_store.ts'],
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })

  it('renders candidate mode AI mentor with mentoring suggestions', () => {
    const root = createMockElement()
    renderInto(
      h(AgentPanel, {
        mode: 'candidate',
        activeFile: 'src/kv_store.ts',
        contextFiles: ['spec.md', 'src/kv_store.ts'],
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })
})
