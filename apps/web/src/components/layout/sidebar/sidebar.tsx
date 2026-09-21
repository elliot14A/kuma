/** @jsxImportSource preact */
import { Award, BookOpen, Code2, type LucideIcon, type LucideProps, Settings } from 'lucide-preact'
import type { ComponentChildren, ComponentType, JSX } from 'preact'
import * as styles from './sidebar.css'

export type SidebarIconComponent =
  | LucideIcon
  | ComponentType<LucideProps>
  | ComponentType<{ size?: number | string | undefined; className?: string | undefined }>

export interface SidebarNavItem {
  id: string
  label: string
  icon: SidebarIconComponent
  badge?: boolean | string | number | undefined
  href?: string | undefined
  onClick?: (() => void) | undefined
  disabled?: boolean | undefined
}

export const DEFAULT_SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Code2,
  },
  {
    id: 'assessments',
    label: 'Assessments',
    icon: Award,
  },
]

export const DEFAULT_SIDEBAR_BOTTOM_ITEMS: SidebarNavItem[] = [
  {
    id: 'docs',
    label: 'Documentation',
    icon: BookOpen,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
]

export interface SidebarProps {
  items?: SidebarNavItem[] | undefined
  bottomItems?: SidebarNavItem[] | undefined
  activeId?: string | undefined
  onSelect?: ((id: string) => void) | undefined
  topSlot?: ComponentChildren | undefined
  bottomSlot?: ComponentChildren | undefined
  className?: string | undefined
}

export function Sidebar({
  items = DEFAULT_SIDEBAR_ITEMS,
  bottomItems = DEFAULT_SIDEBAR_BOTTOM_ITEMS,
  activeId = 'challenges',
  onSelect,
  topSlot,
  bottomSlot,
  className,
}: SidebarProps): JSX.Element {
  const renderItem = (item: SidebarNavItem) => {
    const isActive = activeId === item.id
    const Icon = item.icon

    const handleClick = () => {
      if (item.disabled) return
      if (item.onClick) {
        item.onClick()
      }
      if (onSelect) {
        onSelect(item.id)
      }
    }

    const itemContent = (
      <>
        {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
        <Icon size={18} />
        {item.badge && <span className={styles.itemBadge} aria-hidden="true" />}
      </>
    )

    if (item.href && !item.disabled) {
      return (
        <a
          key={item.id}
          href={item.href}
          onClick={handleClick}
          className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          aria-label={item.label}
          title={item.label}
          data-active={isActive}
        >
          {itemContent}
        </a>
      )
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={handleClick}
        disabled={item.disabled}
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        aria-label={item.label}
        title={item.label}
        data-active={isActive}
      >
        {itemContent}
      </button>
    )
  }

  return (
    <nav className={`${styles.sidebarRail} ${className ?? ''}`.trim()} aria-label="Main Navigation">
      <div className={styles.topGroup}>
        {topSlot}
        {items.map(renderItem)}
      </div>

      <div className={styles.bottomGroup}>
        {bottomItems.map(renderItem)}
        {bottomSlot}
      </div>
    </nav>
  )
}
