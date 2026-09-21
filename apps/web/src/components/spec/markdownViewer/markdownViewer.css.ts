import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const markdownContainerStyle = style({
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.editor,
  color: vars.color.textPrimary,
  padding: `${vars.space.lg} ${vars.space.xl}`,
  overflowY: 'auto',
  fontFamily: vars.font.ui,
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.normal,
})

globalStyle(`${markdownContainerStyle} h1`, {
  fontSize: vars.fontSize.xl,
  fontWeight: 700,
  marginBottom: vars.space.md,
  color: vars.color.textPrimary,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  paddingBottom: vars.space.xs,
})

globalStyle(`${markdownContainerStyle} h2`, {
  fontSize: vars.fontSize.lg,
  fontWeight: 600,
  marginTop: vars.space.lg,
  marginBottom: vars.space.sm,
  color: vars.color.textPrimary,
})

globalStyle(`${markdownContainerStyle} h3`, {
  fontSize: vars.fontSize.base,
  fontWeight: 600,
  marginTop: vars.space.md,
  marginBottom: vars.space.xs,
  color: vars.color.textSecondary,
})

globalStyle(`${markdownContainerStyle} p`, {
  marginBottom: vars.space.sm,
  color: vars.color.textSecondary,
})

globalStyle(`${markdownContainerStyle} ul, ${markdownContainerStyle} ol`, {
  paddingLeft: vars.space.lg,
  marginBottom: vars.space.md,
  color: vars.color.textSecondary,
})

globalStyle(`${markdownContainerStyle} li`, {
  marginBottom: vars.space['2xs'],
})

globalStyle(`${markdownContainerStyle} strong`, {
  color: vars.color.textPrimary,
  fontWeight: 600,
})

globalStyle(`${markdownContainerStyle} code`, {
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  backgroundColor: vars.color.surface,
  padding: `2px ${vars.space.xs}`,
  borderRadius: vars.radii.xs,
  color: vars.color.info,
})

globalStyle(`${markdownContainerStyle} pre`, {
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  backgroundColor: vars.color.background,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radii.sm,
  padding: vars.space.md,
  marginBottom: vars.space.md,
  overflowX: 'auto',
})

globalStyle(`${markdownContainerStyle} pre code`, {
  backgroundColor: 'transparent',
  padding: 0,
  color: vars.color.textPrimary,
})

globalStyle(`${markdownContainerStyle} blockquote`, {
  borderLeft: `3px solid ${vars.color.info}`,
  paddingLeft: vars.space.md,
  margin: `${vars.space.md} 0`,
  color: vars.color.textMuted,
})
