/** @jsxImportSource preact */
import type { ComponentChildren, JSX } from 'preact'
import { badgeRecipe } from './badge.css'

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'draft'
  children?: ComponentChildren
}

export const Badge = ({ variant = 'default', children, className, ...props }: BadgeProps) => {
  const badgeClass = `${badgeRecipe({ variant })} ${className ?? ''}`.trim()

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  )
}
