import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const tabHeaderContainerStyle = style({
  display: 'flex',
  alignItems: 'center',
  height: '35px',
  width: '100%',
  backgroundColor: vars.color.background,
  borderBottom: `1px solid ${vars.color.border}`,
  overflowX: 'auto',
  userSelect: 'none',
  '::-webkit-scrollbar': {
    display: 'none',
  },
})

export const tabItemStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  height: '100%',
  padding: `0 ${vars.space.md}`,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.mono,
  color: vars.color.textSecondary,
  backgroundColor: 'transparent',
  border: 'none',
  borderRight: `1px solid ${vars.color.borderSubtle}`,
  borderTop: '2px solid transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  outline: 'none',
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surface,
      color: vars.color.textPrimary,
    },
    '&[data-active="true"]': {
      backgroundColor: vars.color.editor,
      color: vars.color.textPrimary,
      borderTop: `2px solid ${vars.color.info}`,
      fontWeight: 500,
    },
  },
})

export const closeBtnStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: vars.radii.xs,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  padding: 0,
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
    },
  },
})

export const dirtyDotStyle = style({
  width: '6px',
  height: '6px',
  borderRadius: vars.radii.full,
  backgroundColor: vars.color.warning,
})
