import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const containerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.background,
  borderLeft: `1px solid ${vars.color.border}`,
  userSelect: 'none',
  overflow: 'hidden',
})

export const headerStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '38px',
  padding: `0 ${vars.space.sm}`,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  backgroundColor: vars.color.background,
  flexShrink: 0,
})

export const headerLeftStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: vars.fontSize.xs,
  fontWeight: 600,
  color: vars.color.textPrimary,
})

export const headerRightStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2xs'],
})

export const modelPillStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.surfaceElevated,
  border: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize['3xs'],
  fontFamily: vars.font.mono,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
      borderColor: vars.color.borderFocused,
    },
  },
})

export const iconBtnStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
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

export const contextBarContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2xs'],
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  backgroundColor: vars.color.surface,
  overflowX: 'auto',
  flexShrink: 0,
})

export const contextChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.surfaceElevated,
  fontSize: vars.fontSize['3xs'],
  fontFamily: vars.font.mono,
  color: vars.color.accent,
  flexShrink: 0,
})

export const messageFeedStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  padding: vars.space.md,
  overflowY: 'auto',
  flex: 1,
})

export const userMessageCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.xs,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radii.md,
  backgroundColor: vars.color.surfaceElevated,
  border: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.ui,
  color: vars.color.textPrimary,
  lineHeight: vars.lineHeight.snug,
})

export const messageHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: vars.fontSize['3xs'],
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const agentMessageCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radii.md,
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.ui,
  color: vars.color.textSecondary,
  lineHeight: vars.lineHeight.normal,
})

export const thinkingBox = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2xs'],
  padding: `${vars.space.xs} ${vars.space.sm}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.background,
  borderLeft: `2px solid ${vars.color.accent}`,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
  fontFamily: vars.font.mono,
})

export const codeCardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: vars.radii.sm,
  border: `1px solid ${vars.color.borderSubtle}`,
  backgroundColor: vars.color.editor,
  overflow: 'hidden',
  marginTop: vars.space.xs,
})

export const codeCardHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '28px',
  padding: `0 ${vars.space.sm}`,
  backgroundColor: vars.color.surfaceElevated,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize['2xs'],
  fontFamily: vars.font.mono,
  color: vars.color.textPrimary,
})

export const codeCardActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
})

export const applyBtnStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.accent,
  border: 'none',
  color: vars.color.background,
  fontSize: vars.fontSize['3xs'],
  fontWeight: 600,
  fontFamily: vars.font.ui,
  cursor: 'pointer',
  outline: 'none',
  transition: 'opacity 0.1s ease',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
})

export const codeBlockContent = style({
  padding: vars.space.sm,
  margin: 0,
  fontSize: vars.fontSize['2xs'],
  fontFamily: vars.font.mono,
  color: vars.color.textPrimary,
  overflowX: 'auto',
  whiteSpace: 'pre',
  lineHeight: vars.lineHeight.snug,
})

export const quickSuggestionsContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space['2xs'],
  padding: `0 ${vars.space.md} ${vars.space.xs} ${vars.space.md}`,
  flexShrink: 0,
})

export const suggestionChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space['3xs'],
  padding: `3px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.surfaceElevated,
  border: `1px solid ${vars.color.borderSubtle}`,
  fontSize: vars.fontSize['3xs'],
  fontFamily: vars.font.ui,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.1s ease',
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
      borderColor: vars.color.borderFocused,
      backgroundColor: vars.color.surface,
    },
  },
})

export const composerBox = style({
  display: 'flex',
  flexDirection: 'column',
  padding: vars.space.sm,
  backgroundColor: vars.color.surface,
  borderTop: `1px solid ${vars.color.borderSubtle}`,
  flexShrink: 0,
})

export const composerTextarea = style({
  width: '100%',
  minHeight: '60px',
  maxHeight: '160px',
  padding: vars.space.sm,
  borderRadius: vars.radii.sm,
  backgroundColor: vars.color.editor,
  border: `1px solid ${vars.color.borderSubtle}`,
  color: vars.color.textPrimary,
  fontFamily: vars.font.ui,
  fontSize: vars.fontSize.xs,
  lineHeight: vars.lineHeight.snug,
  resize: 'none',
  outline: 'none',
  transition: 'border-color 0.1s ease',
  selectors: {
    '&:focus': {
      borderColor: vars.color.accent,
    },
    '&::placeholder': {
      color: vars.color.textMuted,
    },
  },
})

export const composerToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: vars.space.xs,
})

export const composerToolbarLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['2xs'],
})

export const sendBtnStyle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  borderRadius: vars.radii.xs,
  backgroundColor: vars.color.accent,
  border: 'none',
  color: vars.color.background,
  cursor: 'pointer',
  outline: 'none',
  transition: 'opacity 0.1s ease',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
})
