import { createVar, style } from '@vanilla-extract/css'
import { vars } from '#/styles/theme.css'

export const paneBasisVar = createVar()
export const paneGrowVar = createVar()
export const paneShrinkVar = createVar()
export const paneDisplayVar = createVar()

export const container = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
})

export const horizontal = style({
  flexDirection: 'row',
})

export const vertical = style({
  flexDirection: 'column',
})

export const resizing = style({
  userSelect: 'none',
})

export const pane = style({
  flexBasis: paneBasisVar,
  flexGrow: paneGrowVar,
  flexShrink: paneShrinkVar,
  display: paneDisplayVar,
  overflow: 'auto',
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
})

export const gutter = style({
  flexShrink: 0,
  backgroundColor: vars.color.borderSubtle,
  position: 'relative',
  zIndex: 10,
  border: 'none',
  padding: 0,
  margin: 0,
  outline: 'none',
  transition: 'background-color 0.15s ease',
  ':hover': {
    backgroundColor: vars.color.borderFocused,
  },
})

export const gutterHorizontal = style({
  width: '4px',
  cursor: 'col-resize',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '-3px',
      right: '-3px',
    },
  },
})

export const gutterVertical = style({
  height: '4px',
  cursor: 'row-resize',
  selectors: {
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '-3px',
      bottom: '-3px',
    },
  },
})

export const gutterActive = style({
  backgroundColor: vars.color.info,
  ':hover': {
    backgroundColor: vars.color.info,
  },
})
