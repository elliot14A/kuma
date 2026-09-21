import { recipe } from '@vanilla-extract/recipes'
import { vars } from '#/styles/theme.css'

export const testBadgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space.xs,
    fontSize: vars.fontSize.xs,
    fontFamily: vars.font.mono,
    fontWeight: 500,
    lineHeight: vars.lineHeight.none,
    padding: `3px ${vars.space.sm}`,
    borderRadius: vars.radii.sm,
    userSelect: 'none',
  },

  variants: {
    status: {
      passed: {
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        color: vars.color.success,
        border: '1px solid rgba(34, 197, 94, 0.3)',
      },
      failed: {
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        color: vars.color.danger,
        border: '1px solid rgba(239, 68, 68, 0.3)',
      },
      running: {
        backgroundColor: 'rgba(56, 189, 248, 0.12)',
        color: vars.color.info,
        border: '1px solid rgba(56, 189, 248, 0.3)',
      },
      idle: {
        backgroundColor: vars.color.surface,
        color: vars.color.textMuted,
        border: `1px solid ${vars.color.border}`,
      },
    },
  },

  defaultVariants: {
    status: 'idle',
  },
})
