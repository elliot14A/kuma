/** @jsxImportSource preact */
import { type ComponentChildren, Fragment, type JSX } from 'preact'
import * as styles from './appHeader.css'

export type HeaderStatusType = 'idle' | 'running' | 'success' | 'danger' | 'warning'

export interface HeaderBreadcrumb {
  label: string
  href?: string | undefined
  onClick?: (() => void) | undefined
  active?: boolean | undefined
}

export interface AppHeaderProps {
  logoText?: string | undefined
  badgeText?: string | undefined
  onLogoClick?: (() => void) | undefined
  breadcrumbs?: HeaderBreadcrumb[] | undefined
  activeTitle?: string | undefined
  statusText?: string | undefined
  statusType?: HeaderStatusType | undefined
  statusSlot?: ComponentChildren | undefined
  actionsSlot?: ComponentChildren | undefined
  children?: ComponentChildren | undefined
  className?: string | undefined
}

export function AppHeader({
  logoText = 'kuma',
  badgeText,
  onLogoClick,
  breadcrumbs,
  activeTitle,
  statusText,
  statusType = 'idle',
  statusSlot,
  actionsSlot,
  children,
  className,
}: AppHeaderProps): JSX.Element {
  return (
    <header className={`${styles.headerContainer} ${className ?? ''}`.trim()}>
      <div className={styles.leftSection}>
        {onLogoClick ? (
          <button
            type="button"
            className={styles.brandLogo}
            onClick={onLogoClick}
            aria-label={`Go to home - ${logoText}`}
          >
            <span>{logoText}</span>
            {badgeText && <span className={styles.brandBadge}>{badgeText}</span>}
          </button>
        ) : (
          <div className={styles.brandLogo}>
            <span>{logoText}</span>
            {badgeText && <span className={styles.brandBadge}>{badgeText}</span>}
          </div>
        )}

        {(breadcrumbs && breadcrumbs.length > 0) || activeTitle ? (
          <nav className={styles.breadcrumbContainer} aria-label="Breadcrumbs">
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            {breadcrumbs && breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1
                return (
                  <Fragment key={`${crumb.label}-${idx}`}>
                    {idx > 0 && (
                      <span className={styles.breadcrumbSeparator} aria-hidden="true">
                        /
                      </span>
                    )}
                    {crumb.onClick ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className={`${styles.breadcrumbItem} ${crumb.active || isLast ? styles.breadcrumbActive : ''}`}
                      >
                        {crumb.label}
                      </button>
                    ) : crumb.href ? (
                      <a
                        href={crumb.href}
                        className={`${styles.breadcrumbItem} ${crumb.active || isLast ? styles.breadcrumbActive : ''}`}
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span
                        className={`${styles.breadcrumbItem} ${crumb.active || isLast ? styles.breadcrumbActive : ''}`}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </Fragment>
                )
              })
            ) : activeTitle ? (
              <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                {activeTitle}
              </span>
            ) : null}
          </nav>
        ) : null}

        {statusSlot ? (
          statusSlot
        ) : statusText ? (
          <div className={styles.statusPill}>
            <span
              className={`${styles.statusDot} ${styles.statusDotVariants[statusType]}`}
              aria-hidden="true"
            />
            <span>{statusText}</span>
          </div>
        ) : null}
      </div>

      <div className={styles.rightSection}>
        {actionsSlot && <div className={styles.actionSlot}>{actionsSlot}</div>}
        {children}
      </div>
    </header>
  )
}
