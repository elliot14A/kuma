/** @jsxImportSource preact */
import type { JSX } from 'preact'
import * as styles from './dockRail.css'

export interface DockRailItem<T extends string = string> {
  id: T
  label: string
  badge?: boolean | string | number | undefined
}

export interface DockRailProps<T extends string = string> {
  items: DockRailItem<T>[]
  activeId: T
  onSelect: (id: T) => void
  className?: string | undefined
}

export function DockRail<T extends string = string>({
  items,
  activeId,
  onSelect,
  className,
}: DockRailProps<T>): JSX.Element {
  return (
    <div
      className={`${styles.dockRailContainer} ${className ?? ''}`.trim()}
      role="tablist"
      aria-label="Side Panels"
    >
      <div className={styles.dockTabList}>
        {items.map((item, index) => {
          const isActive = activeId === item.id

          return (
            <div key={item.id} className={styles.dockTabWrapper}>
              {index > 0 && <span className={styles.dividerLine} aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`${styles.dockTabItem} ${isActive ? styles.dockTabItemActive : ''}`}
                onClick={() => onSelect(item.id)}
                title={item.label}
              >
                {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
                <span className={styles.dockTabLabel}>{item.label}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
