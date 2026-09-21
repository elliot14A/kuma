/** @jsxImportSource preact */
import { assignInlineVars } from '@vanilla-extract/dynamic'
import { type ComponentChildren, Fragment, type JSX, toChildArray } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import * as styles from './splitPane.css'

export type SplitDirection = 'horizontal' | 'vertical'

export interface SplitPaneProps {
  direction?: SplitDirection | undefined
  initialSizes?: number[] | undefined
  minSizes?: number[] | undefined
  collapsedPanes?: boolean[] | undefined
  onResize?: ((sizes: number[]) => void) | undefined
  children: ComponentChildren
  className?: string | undefined
}

export function SplitPane({
  direction = 'horizontal',
  initialSizes,
  minSizes,
  collapsedPanes,
  onResize,
  children,
  className,
}: SplitPaneProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const childArray = toChildArray(children).filter(Boolean)
  const paneCount = childArray.length

  const getDefaultSizes = useCallback((): number[] => {
    if (paneCount <= 0) return []
    if (initialSizes && initialSizes.length === paneCount) {
      const sum = initialSizes.reduce((acc, s) => acc + s, 0)
      if (sum > 0) {
        return initialSizes.map((s) => (s / sum) * 100)
      }
    }
    const defaultPercentage = 100 / paneCount
    return Array.from({ length: paneCount }, () => defaultPercentage)
  }, [paneCount, initialSizes])

  const [sizes, setSizes] = useState<number[]>(getDefaultSizes)
  const [activeGutter, setActiveGutter] = useState<number | null>(null)
  const sizesRef = useRef(sizes)
  sizesRef.current = sizes

  useEffect(() => {
    if (initialSizes && initialSizes.length === paneCount) {
      setSizes(getDefaultSizes())
    }
  }, [initialSizes, paneCount, getDefaultSizes])

  const handlePointerDown = (
    gutterIndex: number,
    e: JSX.TargetedPointerEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const totalPx = direction === 'horizontal' ? containerRect.width : containerRect.height
    if (totalPx <= 0) return

    const startPos = direction === 'horizontal' ? e.clientX : e.clientY
    const leftInitial = sizesRef.current[gutterIndex] ?? 50
    const rightInitial = sizesRef.current[gutterIndex + 1] ?? 50
    const initialPairSizes = [leftInitial, rightInitial] as const

    setActiveGutter(gutterIndex)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY
      const deltaPx = currentPos - startPos
      const deltaPct = (deltaPx / totalPx) * 100

      const minLeft = minSizes?.[gutterIndex] ?? 5
      const minRight = minSizes?.[gutterIndex + 1] ?? 5

      const combinedPct = initialPairSizes[0] + initialPairSizes[1]
      let newLeft = initialPairSizes[0] + deltaPct
      let newRight = initialPairSizes[1] - deltaPct

      if (newLeft < minLeft) {
        newLeft = minLeft
        newRight = combinedPct - minLeft
      } else if (newRight < minRight) {
        newRight = minRight
        newLeft = combinedPct - minRight
      }

      setSizes((prev) => {
        const next = [...prev]
        next[gutterIndex] = newLeft
        next[gutterIndex + 1] = newRight
        onResize?.(next)
        return next
      })
    }

    const handlePointerUp = () => {
      setActiveGutter(null)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isHorizontal ? styles.horizontal : styles.vertical} ${
        activeGutter !== null ? styles.resizing : ''
      } ${className ?? ''}`.trim()}
    >
      {childArray.map((child, idx) => {
        const isCollapsed = collapsedPanes?.[idx] ?? false
        const currentSize = sizes[idx] ?? (paneCount > 0 ? 100 / paneCount : 100)

        const paneStyle = assignInlineVars({
          [styles.paneBasisVar]: isCollapsed ? '0px' : `${currentSize}%`,
          [styles.paneGrowVar]: isCollapsed ? '0' : '1',
          [styles.paneShrinkVar]: '1',
          [styles.paneDisplayVar]: isCollapsed ? 'none' : 'block',
        })

        return (
          <Fragment key={`split-pane-item-${idx}`}>
            <div style={paneStyle} className={styles.pane}>
              {child}
            </div>
            {idx < paneCount - 1 && (
              <button
                type="button"
                aria-label="Resize split panels"
                className={`${styles.gutter} ${
                  isHorizontal ? styles.gutterHorizontal : styles.gutterVertical
                } ${activeGutter === idx ? styles.gutterActive : ''}`}
                onPointerDown={(e) => handlePointerDown(idx, e)}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
