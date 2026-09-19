export const fonts = {
  sans: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  mono: '"Geist Mono", ui-monospace, "SFMono-Regular", Consolas, monospace',
} as const

export const colors = {
  background: '#0A0A0C',
  surface: '#111114',
  surfaceElevated: '#17181C',
  surfaceHover: '#1E1F24',
  surfaceActive: '#26272D',

  border: '#212227',
  borderSubtle: '#191A1E',
  borderStrong: '#34353C',

  textPrimary: '#EDEDEF',
  textSecondary: '#8D8E96',
  textTertiary: '#5B5C64',
  textInverse: '#FFFFFF',

  primary: '#5E6AD2',
  primaryHover: '#4E59BD',
  primaryMuted: 'rgba(94, 106, 210, 0.14)',
  primaryBorder: 'rgba(94, 106, 210, 0.32)',

  teal: '#4FA7B8',
  tealMuted: 'rgba(79, 167, 184, 0.12)',
  tealBorder: 'rgba(79, 167, 184, 0.3)',

  success: '#4CB782',
  successMuted: 'rgba(76, 183, 130, 0.12)',
  successBorder: 'rgba(76, 183, 130, 0.3)',

  warning: '#E5A73B',
  warningMuted: 'rgba(229, 167, 59, 0.12)',
  warningBorder: 'rgba(229, 167, 59, 0.3)',

  danger: '#E5484D',
  dangerMuted: 'rgba(229, 72, 77, 0.12)',
  dangerBorder: 'rgba(229, 72, 77, 0.3)',
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
