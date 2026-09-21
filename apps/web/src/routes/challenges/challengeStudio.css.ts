import { style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const studioRootStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  backgroundColor: vars.color.background,
  overflow: 'hidden',
})

export const studioWorkspaceStyle = style({
  display: 'flex',
  flex: 1,
  height: 'calc(100vh - 38px)',
  width: '100%',
  overflow: 'hidden',
})

export const editorPaneStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.editor,
  overflow: 'hidden',
})

export const editorContentStyle = style({
  display: 'flex',
  flex: 1,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
})

export const actionsGroupStyle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
})

export const rightPaneContainerStyle = style({
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.surface,
  overflow: 'hidden',
})

export const rightContentPaneStyle = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
  width: 'calc(100% - 32px)',
  overflow: 'hidden',
})
