import { describe, expect, it } from 'bun:test'
import { endFileScope, setFileScope } from '@vanilla-extract/css/fileScope'
import { colors, fontSizes, fonts, lineHeights, radii, space, themeTokens } from './tokens'

setFileScope('apps/web/src/styles/tokens.test.ts')
const { vars } = await import('./theme.css')
endFileScope()

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '')
  const bigint = Number.parseInt(cleanHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((val) => {
    const srgb = val / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1)
  const lum2 = getRelativeLuminance(hex2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

describe('Zed Design Tokens', () => {
  describe('colors palette', () => {
    it('defines all required Zed Dark color tokens with correct values', () => {
      expect(colors.background).toBe('#21252b')
      expect(colors.editor).toBe('#282c34')
      expect(colors.surface).toBe('#21252b')
      expect(colors.surfaceElevated).toBe('#2c313a')
      expect(colors.border).toBe('#181a1f')
      expect(colors.borderSubtle).toBe('#1e2227')
      expect(colors.borderFocused).toBe('#528bff')
      expect(colors.textPrimary).toBe('#abb2bf')
      expect(colors.textSecondary).toBe('#828997')
      expect(colors.textMuted).toBe('#5c6370')
      expect(colors.success).toBe('#98c379')
      expect(colors.danger).toBe('#e06c75')
      expect(colors.warning).toBe('#e5c07b')
      expect(colors.info).toBe('#61afef')
    })

    it('ensures high contrast for text tokens on editor and canvas backgrounds', () => {
      const primaryOnBackgroundContrast = getContrastRatio(colors.textPrimary, colors.background)
      const primaryOnEditorContrast = getContrastRatio(colors.textPrimary, colors.editor)
      const secondaryOnBackgroundContrast = getContrastRatio(
        colors.textSecondary,
        colors.background,
      )

      expect(primaryOnBackgroundContrast).toBeGreaterThanOrEqual(4.5)
      expect(primaryOnEditorContrast).toBeGreaterThanOrEqual(4.5)
      expect(secondaryOnBackgroundContrast).toBeGreaterThanOrEqual(3.0)
    })
  })

  describe('fonts', () => {
    it('defines ui and monospace font stacks properly', () => {
      expect(fonts.ui).toContain('system-ui')
      expect(fonts.mono).toContain('ZedMono')
      expect(fonts.mono).toContain('JetBrains Mono')
      expect(fonts.mono).toContain('Fira Code')
      expect(fonts.mono).toContain('monospace')
    })
  })

  describe('spacing, radii, typography scales', () => {
    it('defines spacing scale with required standard stops', () => {
      expect(space.none).toBe('0px')
      expect(space.sm).toBeDefined()
      expect(space.md).toBeDefined()
      expect(space.lg).toBeDefined()
      expect(space.xl).toBeDefined()
    })

    it('defines radii tokens with standard radius options', () => {
      expect(radii.none).toBe('0px')
      expect(radii.sm).toBeDefined()
      expect(radii.md).toBeDefined()
      expect(radii.lg).toBeDefined()
      expect(radii.full).toBe('9999px')
    })

    it('defines font size and line height scales', () => {
      expect(fontSizes.base).toBeDefined()
      expect(fontSizes.xs).toBeDefined()
      expect(fontSizes.sm).toBeDefined()
      expect(fontSizes.lg).toBeDefined()
      expect(fontSizes.xl).toBeDefined()

      expect(lineHeights.none).toBe('1')
      expect(lineHeights.normal).toBeDefined()
    })
  })

  describe('themeTokens consolidated export', () => {
    it('consolidates all token groups into themeTokens object', () => {
      expect(themeTokens).toEqual({
        colors,
        fonts,
        space,
        radii,
        fontSizes,
        lineHeights,
      })
    })
  })

  describe('vanilla-extract theme vars', () => {
    it('exports vars mapped from design tokens', () => {
      expect(vars).toBeDefined()
      expect(vars.color).toBeDefined()
      expect(vars.space).toBeDefined()
      expect(vars.radii).toBeDefined()
      expect(vars.fontSize).toBeDefined()
      expect(vars.lineHeight).toBeDefined()
    })
  })
})
