/** @jsxImportSource preact */
import { CheckCircle2, CircleDashed, Loader2, XCircle } from 'lucide-preact'
import type { JSX } from 'preact'
import { testBadgeRecipe } from './testBadge.css'

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed'

export interface TestBadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  status: TestStatus
  passed?: number | undefined
  total?: number | undefined
  durationMs?: number | undefined
}

const getStatusIcon = (status: TestStatus) => {
  switch (status) {
    case 'passed':
      return <CheckCircle2 size={13} />
    case 'failed':
      return <XCircle size={13} />
    case 'running':
      return <Loader2 size={13} className="animate-spin" />
    default:
      return <CircleDashed size={13} />
  }
}

export const TestBadge = ({
  status,
  passed = 0,
  total = 0,
  durationMs,
  className,
  ...props
}: TestBadgeProps) => {
  const badgeClass = `${testBadgeRecipe({ status })} ${className ?? ''}`.trim()

  const getLabel = () => {
    switch (status) {
      case 'passed':
        return `Tests: ${passed}/${total} passed${durationMs !== undefined ? ` (${durationMs}ms)` : ''}`
      case 'failed':
        return `Tests: ${total - passed} failed, ${passed} passed`
      case 'running':
        return 'Running tests in sandbox...'
      default:
        return 'Tests: Not run yet'
    }
  }

  return (
    <span className={badgeClass} {...props}>
      {getStatusIcon(status)}
      <span>{getLabel()}</span>
    </span>
  )
}
