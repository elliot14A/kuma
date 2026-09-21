export const fonts = {
  ui: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: '"ZedMono", "JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Monaco, Consolas, monospace',
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
} as const

export const colors = {
  background: '#21252b',
  editor: '#282c34',
  surface: '#21252b',
  surfaceElevated: '#2c313a',
  border: '#181a1f',
  borderSubtle: '#1e2227',
  borderFocused: '#528bff',
  textPrimary: '#abb2bf',
  textSecondary: '#828997',
  textMuted: '#5c6370',
  accent: '#528bff',
  info: '#61afef',
  success: '#98c379',
  warning: '#e5c07b',
  danger: '#e06c75',
  purple: '#c678dd',
  cyan: '#56b6c2',
} as const

export const space = {
  none: '0px',
  '3xs': '2px',
  '2xs': '4px',
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  '3xl': '40px',
} as const

export const radii = {
  none: '0px',
  xs: '3px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
} as const

export const fontSizes = {
  '3xs': '0.6875rem',
  '2xs': '0.75rem',
  xs: '0.8125rem',
  sm: '0.875rem',
  base: '0.9375rem',
  lg: '1.0625rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
} as const

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.4',
  normal: '1.6',
} as const

export const themeTokens = {
  colors,
  fonts,
  space,
  radii,
  fontSizes,
  lineHeights,
} as const

export type ThemeTokens = typeof themeTokens
export type Colors = typeof colors
export type Fonts = typeof fonts
export type Space = typeof space
export type Radii = typeof radii
export type FontSizes = typeof fontSizes
export type LineHeights = typeof lineHeights
