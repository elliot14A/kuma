/** @jsxImportSource preact */
import {
  Braces,
  CodeXml,
  Database,
  FileCode,
  FileCode2,
  FileText,
  FlaskConical,
  Settings,
  Terminal,
} from 'lucide-preact'
import { colors } from '#/styles/tokens'

export interface FileIconProps {
  fileName: string
  category?: 'spec' | 'src' | 'test' | undefined
  size?: number | undefined
}

export const FileIcon = ({ fileName, category, size = 13 }: FileIconProps) => {
  const lower = fileName.toLowerCase()

  if (
    lower.includes('.test.') ||
    lower.includes('.spec.') ||
    lower.endsWith('_test.py') ||
    lower.startsWith('test_') ||
    category === 'test'
  ) {
    return <FlaskConical size={size} color={colors.success} />
  }
  if (
    lower === 'package.json' ||
    lower === 'tsconfig.json' ||
    lower === 'bunfig.toml' ||
    lower === 'bun.lock' ||
    lower === 'bun.lockb'
  ) {
    return <Settings size={size} color={colors.warning} />
  }
  if (lower.endsWith('.json')) {
    return <Braces size={size} color={colors.warning} />
  }
  if (lower.endsWith('.md') || lower.endsWith('.markdown') || category === 'spec') {
    return <FileText size={size} color={colors.info} />
  }
  if (lower.endsWith('.tsx') || lower.endsWith('.jsx')) {
    return <CodeXml size={size} color={colors.cyan} />
  }
  if (lower.endsWith('.ts')) {
    return <FileCode2 size={size} color={colors.info} />
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return <FileCode size={size} color={colors.warning} />
  }
  if (lower.endsWith('.py')) {
    return <FileCode2 size={size} color={colors.success} />
  }
  if (lower.endsWith('.sql')) {
    return <Database size={size} color={colors.purple} />
  }
  if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh')) {
    return <Terminal size={size} color={colors.success} />
  }
  if (
    lower.endsWith('.css') ||
    lower.endsWith('.scss') ||
    lower.endsWith('.sass') ||
    lower.endsWith('.less')
  ) {
    return <FileCode size={size} color={colors.purple} />
  }
  if (lower.endsWith('.html') || lower.endsWith('.xml') || lower.endsWith('.svg')) {
    return <CodeXml size={size} color={colors.danger} />
  }
  if (lower.startsWith('.env') || lower.endsWith('.config.js') || lower.endsWith('.config.ts')) {
    return <Settings size={size} color={colors.warning} />
  }
  return <FileText size={size} color={colors.textSecondary} />
}
