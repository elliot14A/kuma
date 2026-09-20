import { createGlobalTheme, globalStyle } from '@vanilla-extract/css'
import { colors, fontSizes, fonts, lineHeights, radii, space } from './tokens'

export const vars = createGlobalTheme(':root', {
  color: colors,
  font: fonts,
  space,
  radii,
  fontSize: fontSizes,
  lineHeight: lineHeights,
})

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
})

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  height: '100%',
  width: '100%',
  backgroundColor: vars.color.background,
  color: vars.color.textPrimary,
  fontFamily: fonts.ui,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
