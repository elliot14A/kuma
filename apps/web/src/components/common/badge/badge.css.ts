import { recipe } from '@vanilla-extract/recipes'
import { vars } from '#/styles/theme.css'

export const badgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['2xs'],
    fontFamily: vars.font.mono,
    fontSize: vars.fontSize['3xs'],
    fontWeight: 600,
    lineHeight: vars.lineHeight.none,
    padding: `2px ${vars.space.xs}`,
    borderRadius: vars.radii.xs,
    border: `1px solid ${vars.color.border}`,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    userSelect: 'none',
  },

  variants: {
    variant: {
      default: {
        backgroundColor: vars.color.surface,
        color: vars.color.textSecondary,
        borderColor: vars.color.border,
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        color: vars.color.success,
        borderColor: 'rgba(34, 197, 94, 0.3)',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        color: vars.color.warning,
        borderColor: 'rgba(245, 158, 11, 0.3)',
      },
      danger: {
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        color: vars.color.danger,
        borderColor: 'rgba(239, 68, 68, 0.3)',
      },
      info: {
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        color: vars.color.info,
        borderColor: 'rgba(56, 189, 248, 0.3)',
      },
      draft: {
        backgroundColor: vars.color.surfaceElevated,
        color: vars.color.textMuted,
        borderColor: vars.color.borderSubtle,
      },
    },
  },

  defaultVariants: {
    variant: 'default',
  },
})
