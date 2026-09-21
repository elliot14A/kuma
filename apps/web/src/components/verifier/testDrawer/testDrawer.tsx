/** @jsxImportSource preact */
import type { ExecutionResult } from '@kuma/domain'
import { CheckCircle2, ChevronDown, ChevronUp, Terminal } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { colors } from '#/styles/tokens'
import { TestBadge, type TestStatus } from '../testBadge'
import {
  drawerBodyStyle,
  drawerContainerStyle,
  drawerHeaderStyle,
  drawerToggleBtnStyle,
  emptyStateStyle,
  headerLeftStyle,
  headerRightStyle,
  tabButtonStyle,
  tabGroupStyle,
  terminalOutputStyle,
  testItemLeftStyle,
  testItemStyle,
  testListStyle,
} from './testDrawer.css'

export interface TestDrawerProps {
  status: TestStatus
  result?: ExecutionResult | null | undefined
  isExpanded?: boolean | undefined
  onToggleExpand?: (() => void) | undefined
}

interface ParsedTestCase {
  name: string
  status: 'passed' | 'failed'
}

export const TestDrawer = ({
  status,
  result,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: TestDrawerProps) => {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'tests' | 'terminal'>('tests')

  const isExpanded = controlledExpanded ?? internalExpanded
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand()
    } else {
      setInternalExpanded(!internalExpanded)
    }
  }

  const passedCount = result?.summary?.passed ?? 0
  const totalCount = result?.summary?.total ?? 0

  const testLines: ParsedTestCase[] = []
  if (result?.stdout) {
    const lines = result.stdout.split('\n')
    for (const line of lines) {
      if (line.includes('✓')) {
        testLines.push({
          name: line.replace('✓', '').trim(),
          status: 'passed',
        })
      } else if (line.includes('✗')) {
        testLines.push({
          name: line.replace('✗', '').trim(),
          status: 'failed',
        })
      }
    }
  }

  return (
    <div className={drawerContainerStyle}>
      <div className={drawerHeaderStyle}>
        <button
          type="button"
          className={drawerToggleBtnStyle}
          onClick={handleToggle}
          aria-expanded={isExpanded}
        >
          <div className={headerLeftStyle}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <TestBadge
              status={status}
              passed={passedCount}
              total={totalCount}
              durationMs={result?.durationMs}
            />
          </div>
        </button>

        <div className={headerRightStyle}>
          <div className={tabGroupStyle}>
            <button
              type="button"
              className={tabButtonStyle}
              data-active={activeTab === 'tests' ? 'true' : 'false'}
              onClick={() => {
                setActiveTab('tests')
                if (!isExpanded) handleToggle()
              }}
            >
              Test Cases
            </button>
            <button
              type="button"
              className={tabButtonStyle}
              data-active={activeTab === 'terminal' ? 'true' : 'false'}
              onClick={() => {
                setActiveTab('terminal')
                if (!isExpanded) handleToggle()
              }}
            >
              <Terminal size={11} />
              Terminal
            </button>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div className={drawerBodyStyle}>
          {activeTab === 'tests' ? (
            <div className={testListStyle}>
              {testLines.length > 0 ? (
                testLines.map((tc) => (
                  <div key={tc.name} className={testItemStyle}>
                    <div className={testItemLeftStyle}>
                      <CheckCircle2 size={13} color={colors.success} />
                      <span>{tc.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={emptyStateStyle}>
                  {status === 'running'
                    ? 'Executing test suite in isolated container...'
                    : 'Click "Verify Solution" to run sandbox tests.'}
                </div>
              )}
            </div>
          ) : (
            <pre className={terminalOutputStyle}>
              {result?.stdout || result?.stderr || 'No console output.'}
            </pre>
          )}
        </div>
      ) : null}
    </div>
  )
}
