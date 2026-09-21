/** @jsxImportSource preact */
import type { ComponentChildren, JSX } from 'preact'
import { buttonRecipe, iconStyle } from './button.css'

export interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ComponentChildren
  disabled?: boolean
  children?: ComponentChildren
}

export const Button = ({
  variant = 'secondary',
  size = 'md',
  icon,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) => {
  const buttonClass = `${buttonRecipe({ variant, size })} ${className ?? ''}`.trim()

  return (
    <button className={buttonClass} disabled={disabled} {...props}>
      {icon ? <span className={iconStyle}>{icon}</span> : null}
      {children}
    </button>
  )
}
