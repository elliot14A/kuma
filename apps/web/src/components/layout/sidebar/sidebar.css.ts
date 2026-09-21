import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const sidebarRail = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '44px',
  height: '100%',
  backgroundColor: vars.color.background,
  borderRight: `1px solid ${vars.color.border}`,
  paddingTop: vars.space.sm,
  paddingBottom: vars.space.sm,
  userSelect: 'none',
  flexShrink: 0,
})

export const topGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.xs,
  width: '100%',
})

export const bottomGroup = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.xs,
  width: '100%',
})

export const navItem = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: vars.radii.xs,
  color: vars.color.textMuted,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'none',
  transition: 'color 0.15s ease, background-color 0.15s ease',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.surface,
  },
  ':focus-visible': {
    outline: `2px solid ${vars.color.borderFocused}`,
    outlineOffset: '-1px',
  },
  ':disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
})

export const navItemActive = style({
  color: vars.color.textPrimary,
  backgroundColor: vars.color.surfaceElevated,
})

export const activeIndicator = style({
  position: 'absolute',
  left: 0,
  width: '2px',
  height: '18px',
  backgroundColor: vars.color.textPrimary,
  borderRadius: `0 ${vars.radii.xs} ${vars.radii.xs} 0`,
})

export const itemBadge = style({
  position: 'absolute',
  top: vars.space['2xs'],
  right: vars.space['2xs'],
  minWidth: '6px',
  height: '6px',
  borderRadius: vars.radii.full,
  backgroundColor: vars.color.info,
})
