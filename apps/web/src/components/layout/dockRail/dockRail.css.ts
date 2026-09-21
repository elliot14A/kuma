import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const dockRailContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '32px',
  height: '100%',
  backgroundColor: vars.color.background,
  borderLeft: `1px solid ${vars.color.border}`,
  userSelect: 'none',
  flexShrink: 0,
  zIndex: 10,
})

export const dockTabList = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: `${vars.space.xs} 0`,
})

export const dockTabWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
})

export const dockTabItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: `${vars.space.md} 0`,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: vars.color.textMuted,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  position: 'relative',
  ':hover': {
    color: vars.color.textPrimary,
    backgroundColor: vars.color.surfaceElevated,
  },
})

export const dockTabItemActive = style({
  backgroundColor: vars.color.surface,
  color: vars.color.textPrimary,
  fontWeight: 600,
  ':hover': {
    backgroundColor: vars.color.surface,
    color: vars.color.textPrimary,
  },
})

export const dockTabLabel = style({
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  fontSize: '11px',
  fontFamily: vars.font.ui,
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  lineHeight: 1,
})

export const dividerLine = style({
  width: '16px',
  height: '1px',
  backgroundColor: vars.color.border,
  margin: `${vars.space.xs} 0`,
  opacity: 0.8,
})

export const activeIndicator = style({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '2px',
  backgroundColor: vars.color.accent,
})
