import { createVar, style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const depthPaddingVar = createVar()

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.background,
  borderRight: `1px solid ${vars.color.border}`,
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

export const headerActionsStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
})

export const headerActionBtnStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: vars.radii.xs,
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
    },
  },
})

export const projectRootStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  height: '28px',
  padding: `0 ${vars.space.sm}`,
  fontSize: vars.fontSize['3xs'],
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: vars.color.textSecondary,
})

export const treeListStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  padding: `0 ${vars.space['3xs']}`,
  marginBottom: vars.space.sm,
})

export const rowItemStyle = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: vars.space.xs,
  height: '26px',
  paddingLeft: depthPaddingVar,
  paddingRight: vars.space.xs,
  borderRadius: vars.radii.xs,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.ui,
  color: vars.color.textSecondary,
  backgroundColor: 'transparent',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.1s ease',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
    },
    '&[data-active="true"]': {
      backgroundColor: vars.color.surfaceElevated,
      color: vars.color.textPrimary,
      fontWeight: 500,
    },
  },
})

export const folderChevronStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  flexShrink: 0,
  color: vars.color.textMuted,
  transition: 'transform 0.1s ease',
})

export const itemIconStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

export const itemLabelStyle = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
