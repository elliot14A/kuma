import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const editorContainerStyle = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.editor,
  overflow: 'hidden',
})

export const fallbackTextareaStyle = style({
  width: '100%',
  height: '100%',
  backgroundColor: vars.color.editor,
  color: vars.color.textPrimary,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.normal,
  padding: vars.space.md,
  border: 'none',
  outline: 'none',
  resize: 'none',
  tabSize: 2,
  whiteSpace: 'pre',
  overflow: 'auto',
})
