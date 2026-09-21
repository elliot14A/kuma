/** @jsxImportSource preact */
import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'

setFileScope('apps/web/src/components/common/common.test.ts')
const { Badge } = await import('./badge')
const { Button } = await import('./button')
const { FileIcon } = await import('./fileIcon')
endFileScope()

describe('Common Components', () => {
  it('Badge renders properly with default and status variants', () => {
    const badge = Badge({ variant: 'success', children: 'Passed' })
    expect(badge).toBeDefined()
    expect(badge.type).toBe('span')
    expect(badge.props.children).toBe('Passed')
  })

  it('Button renders properly with primary and secondary variants', () => {
    const button = Button({ variant: 'primary', children: 'Verify Solution' })
    expect(button).toBeDefined()
    expect(button.type).toBe('button')
    expect(button.props.children).toEqual([null, 'Verify Solution'])
  })

  it('FileIcon renders appropriate icons for different file types', () => {
    const tsIcon = FileIcon({ fileName: 'kv.ts' })
    const testIcon = FileIcon({ fileName: 'kv.test.ts' })
    const mdIcon = FileIcon({ fileName: 'spec.md' })
    const jsonIcon = FileIcon({ fileName: 'data.json' })

    expect(tsIcon).toBeDefined()
    expect(testIcon).toBeDefined()
    expect(mdIcon).toBeDefined()
    expect(jsonIcon).toBeDefined()
  })
})
