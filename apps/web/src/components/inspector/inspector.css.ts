import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { vars } from '#/styles/theme.css'

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.background,
  borderLeft: `1px solid ${vars.color.border}`,
  userSelect: 'none',
  overflowY: 'auto',
})

export const headerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '35px',
  padding: `0 ${vars.space.sm}`,
  fontSize: vars.fontSize['3xs'],
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: vars.color.textMuted,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

export const headerTitleGroupStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  color: vars.color.textPrimary,
})

export const sectionTitleStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `${vars.space.sm} ${vars.space.sm} ${vars.space['2xs']} ${vars.space.sm}`,
  fontSize: vars.fontSize['3xs'],
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.color.textMuted,
})

export const listStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  padding: `0 ${vars.space['2xs']}`,
  marginBottom: vars.space.xs,
})

export const itemRowStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '28px',
  padding: `0 ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.ui,
  color: vars.color.textSecondary,
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
    },
  },
})

export const itemLeftStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
})

export const itemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

export const itemValueStyle = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  color: vars.color.textPrimary,
})

export const difficultyBadgeRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['3xs'],
    padding: `1px ${vars.space.xs}`,
    borderRadius: vars.radii.xs,
    fontFamily: vars.font.mono,
    fontSize: vars.fontSize['3xs'],
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: vars.color.surfaceElevated,
  },
  variants: {
    difficulty: {
      easy: {
        color: vars.color.success,
      },
      medium: {
        color: vars.color.warning,
      },
      hard: {
        color: vars.color.danger,
      },
    },
  },
  defaultVariants: {
    difficulty: 'medium',
  },
})

export const descriptionBoxStyle = style({
  padding: `${vars.space.xs} ${vars.space.sm}`,
  margin: `0 ${vars.space['2xs']} ${vars.space.xs} ${vars.space['2xs']}`,
  backgroundColor: vars.color.surfaceElevated,
  borderLeft: `2px solid ${vars.color.info}`,
  borderRadius: vars.radii.xs,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.ui,
  color: vars.color.textSecondary,
  lineHeight: vars.lineHeight.snug,
})

export const tagListStyle = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['2xs'],
  padding: `0 ${vars.space.sm}`,
  marginBottom: vars.space.md,
})

export const tagPillStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.surfaceElevated,
  border: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize['2xs'],
  fontFamily: vars.font.mono,
  color: vars.color.textSecondary,
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
      borderColor: vars.color.borderFocused,
    },
  },
})
