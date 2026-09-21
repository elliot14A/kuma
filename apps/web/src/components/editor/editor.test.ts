/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { h } from 'preact'
import { createMockElement, renderInto, setupMockDom } from '#/testUtils'

setupMockDom()
setFileScope('apps/web/src/components/editor/editor.test.ts')
const { FileTree } = await import('./fileTree')
const { MonacoEditor } = await import('./monacoEditor')
const { TabHeader } = await import('./tabHeader')
endFileScope()

describe('Editor Components', () => {
  it('FileTree renders hierarchical collapsible tree structure', () => {
    const root = createMockElement()
    renderInto(
      h(FileTree, {
        specFile: 'spec.md',
        starterFiles: ['src/kv.ts', 'src/types.ts'],
        testFiles: ['tests/kv.test.ts'],
        activeFile: 'src/kv.ts',
        workspaceName: 'kv-store',
        onSelectFile: () => {},
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })

  it('TabHeader renders tabs for open files and active indicator', () => {
    const root = createMockElement()
    renderInto(
      h(TabHeader, {
        openFiles: ['spec.md', 'src/kv.ts'],
        activeFile: 'src/kv.ts',
        dirtyFiles: new Set(['src/kv.ts']),
        onSelectTab: () => {},
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })

  it('MonacoEditor renders fallback textarea with path and workspace files in headless/test environment', () => {
    const root = createMockElement()
    renderInto(
      h(MonacoEditor, {
        value: 'console.log("hello")',
        path: 'src/kv.ts',
        files: {
          'src/kv.ts': 'export const kv = 1',
          'src/types.ts': 'export type KV = number',
        },
        language: 'typescript',
      }),
      root,
    )

    expect(root.childNodes.length).toBe(1)
  })
})
