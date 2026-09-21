import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const drawerContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: vars.color.editor,
  borderTop: `1px solid ${vars.color.border}`,
  transition: 'height 0.2s ease',
  userSelect: 'none',
})

export const drawerHeaderStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '36px',
  width: '100%',
  padding: `0 ${vars.space.md}`,
  backgroundColor: vars.color.background,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

export const drawerToggleBtnStyle = style({
  background: 'none',
  border: 'none',
  color: 'inherit',
  cursor: 'pointer',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  outline: 'none',
})

export const headerLeftStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
})

export const headerRightStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.mono,
  color: vars.color.textMuted,
})

export const tabGroupStyle = style({
  display: 'flex',
  gap: vars.space['2xs'],
})

export const tabButtonStyle = style({
  background: 'transparent',
  border: 'none',
  color: vars.color.textMuted,
  borderRadius: vars.radii.xs,
  padding: `2px ${vars.space.xs}`,
  fontSize: vars.fontSize['2xs'],
  fontFamily: vars.font.ui,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2xs'],
  outline: 'none',
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surface,
      color: vars.color.textPrimary,
    },
    '&[data-active="true"]': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
      fontWeight: 500,
    },
  },
})

export const drawerBodyStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '200px',
  overflowY: 'auto',
  backgroundColor: vars.color.editor,
  padding: vars.space.sm,
})

export const testListStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

export const testItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radii.xs,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.mono,
  backgroundColor: vars.color.surface,
})

export const testItemLeftStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
})

export const emptyStateStyle = style({
  color: vars.color.textMuted,
  padding: vars.space.sm,
  fontFamily: vars.font.ui,
  fontSize: vars.fontSize.xs,
})

export const terminalOutputStyle = style({
  height: '100%',
  width: '100%',
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  lineHeight: vars.lineHeight.snug,
  color: vars.color.textSecondary,
  backgroundColor: vars.color.editor,
  padding: vars.space.sm,
  whiteSpace: 'pre-wrap',
  overflowY: 'auto',
})
