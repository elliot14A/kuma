export const fonts = {
  ui: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: '"JetBrains Mono", "Fira Code", monospace',
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const

export const colors = {
  background: '#18181b',
  editor: '#121214',
  surface: '#27272a',
  surfaceElevated: '#3f3f46',
  border: '#27272a',
  borderSubtle: '#202023',
  borderFocused: '#52525b',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#38bdf8',
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
  sm: '5px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const

export const fontSizes = {
  '3xs': '0.625rem',
  '2xs': '0.6875rem',
  xs: '0.75rem',
  sm: '0.8125rem',
  base: '0.875rem',
  lg: '1.0625rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
} as const

export const lineHeights = {
  none: '1',
  tight: '1.2',
  snug: '1.35',
  normal: '1.5',
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
