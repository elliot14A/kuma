import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { vars } from '#/styles/theme.css'

export const buttonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space.xs,
    fontFamily: vars.font.ui,
    fontWeight: 500,
    fontSize: vars.fontSize.xs,
    lineHeight: vars.lineHeight.none,
    borderRadius: vars.radii.sm,
    border: `1px solid ${vars.color.border}`,
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    outline: 'none',
    userSelect: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    ':focus-visible': {
      borderColor: vars.color.borderFocused,
      boxShadow: `0 0 0 1px ${vars.color.borderFocused}`,
    },
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: vars.color.surfaceElevated,
        color: vars.color.textPrimary,
        borderColor: vars.color.borderFocused,
        fontWeight: 500,
        ':hover': {
          borderColor: vars.color.accent,
        },
        ':active': {
          backgroundColor: vars.color.surface,
        },
      },
      secondary: {
        backgroundColor: vars.color.surface,
        color: vars.color.textPrimary,
        borderColor: vars.color.border,
        ':hover': {
          backgroundColor: vars.color.surfaceElevated,
        },
        ':active': {
          backgroundColor: vars.color.surface,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: vars.color.textSecondary,
        borderColor: 'transparent',
        ':hover': {
          backgroundColor: vars.color.surfaceElevated,
          color: vars.color.textPrimary,
        },
        ':active': {
          backgroundColor: vars.color.surface,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: vars.color.textPrimary,
        borderColor: vars.color.border,
        ':hover': {
          backgroundColor: vars.color.surfaceElevated,
          borderColor: vars.color.borderFocused,
        },
      },
      danger: {
        backgroundColor: vars.color.danger,
        color: vars.color.textPrimary,
        borderColor: vars.color.danger,
        ':hover': {
          filter: 'brightness(1.1)',
        },
      },
    },
    size: {
      sm: {
        height: '24px',
        padding: `0 ${vars.space.xs}`,
        fontSize: vars.fontSize['2xs'],
      },
      md: {
        height: '28px',
        padding: `0 ${vars.space.sm}`,
        fontSize: vars.fontSize.xs,
      },
      lg: {
        height: '34px',
        padding: `0 ${vars.space.md}`,
        fontSize: vars.fontSize.base,
      },
    },
  },

  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
})

export const iconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})
