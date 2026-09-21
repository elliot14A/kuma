import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'
import { fonts } from '#/styles/tokens'

export const headerContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '38px',
  paddingLeft: vars.space.md,
  paddingRight: vars.space.md,
  backgroundColor: vars.color.background,
  borderBottom: `1px solid ${vars.color.border}`,
  userSelect: 'none',
  flexShrink: 0,
  fontFamily: fonts.sans,
})

export const leftSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  minWidth: 0,
})

export const brandLogo = style({
  fontFamily: fonts.mono,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.textPrimary,
  letterSpacing: '-0.02em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['2xs'],
  cursor: 'pointer',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  transition: 'opacity 0.15s ease',
  ':hover': {
    opacity: 0.85,
  },
})

export const brandBadge = style({
  fontSize: vars.fontSize['3xs'],
  fontFamily: fonts.mono,
  textTransform: 'uppercase',
  color: vars.color.textMuted,
  backgroundColor: vars.color.surface,
  paddingTop: vars.space['3xs'],
  paddingBottom: vars.space['3xs'],
  paddingLeft: vars.space.xs,
  paddingRight: vars.space.xs,
  borderRadius: vars.radii.xs,
  border: `1px solid ${vars.color.borderSubtle}`,
  marginLeft: vars.space.xs,
})

export const breadcrumbContainer = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.fontSize.xs,
  fontFamily: fonts.sans,
  color: vars.color.textSecondary,
})

export const breadcrumbSeparator = style({
  color: vars.color.textMuted,
  fontSize: '11px',
  display: 'inline-flex',
  alignItems: 'center',
  userSelect: 'none',
  padding: '0 2px',
})

export const breadcrumbItem = style({
  color: vars.color.textSecondary,
  textDecoration: 'none',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: vars.fontSize.xs,
  fontFamily: fonts.sans,
  transition: 'color 0.15s ease',
  ':hover': {
    color: vars.color.textPrimary,
  },
})

export const breadcrumbActive = style({
  color: vars.color.textPrimary,
  fontWeight: 500,
})

export const centerSection = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
})

export const rightSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  marginLeft: 'auto',
})

export const statusPill = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  paddingTop: '2px',
  paddingBottom: '2px',
  paddingLeft: vars.space.sm,
  paddingRight: vars.space.sm,
  borderRadius: vars.radii.full,
  fontSize: '11px',
  fontFamily: fonts.mono,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  color: vars.color.textSecondary,
  marginLeft: vars.space.sm,
  flexShrink: 0,
})

export const statusDot = style({
  width: '6px',
  height: '6px',
  borderRadius: vars.radii.full,
  flexShrink: 0,
})

export const statusDotVariants = styleVariants({
  idle: { backgroundColor: vars.color.textMuted },
  running: { backgroundColor: vars.color.info },
  success: { backgroundColor: vars.color.success },
  danger: { backgroundColor: vars.color.danger },
  warning: { backgroundColor: vars.color.warning },
})

export const actionSlot = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
})

export const actionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  paddingTop: vars.space['2xs'],
  paddingBottom: vars.space['2xs'],
  paddingLeft: vars.space.sm,
  paddingRight: vars.space.sm,
  fontSize: vars.fontSize.xs,
  fontFamily: fonts.sans,
  fontWeight: 500,
  borderRadius: vars.radii.xs,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  color: vars.color.textPrimary,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
  ':hover': {
    backgroundColor: vars.color.surfaceElevated,
    borderColor: vars.color.borderFocused,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})
