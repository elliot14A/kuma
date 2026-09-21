/** @jsxImportSource preact */
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import { useEffect, useRef } from 'preact/hooks'
import { colors, fonts } from '#/styles/tokens'
import { editorContainerStyle, fallbackTextareaStyle } from './monacoEditor.css'

type EditorInstance = Parameters<OnMount>[0]

export interface MonacoEditorProps {
  value: string
  path?: string | undefined
  files?: Record<string, string> | undefined
  language?: string | undefined
  readOnly?: boolean | undefined
  onChange?: ((value: string) => void) | undefined
}

const setupMonaco = (
  monaco: Parameters<BeforeMount>[0],
  files?: Record<string, string> | undefined,
) => {
  monaco.editor.defineTheme('zed-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'abb2bf', background: '282c34' },
      { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
      { token: 'string', foreground: '98c379' },
      { token: 'number', foreground: 'd19a66' },
      { token: 'type', foreground: 'e5c07b' },
      { token: 'function', foreground: '61afef' },
      { token: 'variable', foreground: 'e06c75' },
      { token: 'delimiter', foreground: 'abb2bf' },
    ],
    colors: {
      'editor.background': colors.editor,
      'editor.foreground': colors.textPrimary,
      'editor.lineHighlightBackground': colors.surfaceElevated,
      'editorCursor.foreground': colors.accent,
      'editorWhitespace.foreground': colors.borderSubtle,
      'editorIndentGuide.background1': colors.borderSubtle,
      'editorIndentGuide.activeBackground1': colors.borderFocused,
      'editorLineNumber.foreground': colors.textMuted,
      'editorLineNumber.activeForeground': colors.textPrimary,
      'editorGutter.background': colors.editor,
      'editorSuggestWidget.background': colors.surfaceElevated,
      'editorSuggestWidget.border': colors.border,
      'editorSuggestWidget.foreground': colors.textPrimary,
      'editorSuggestWidget.selectedBackground': colors.borderFocused,
      'editorHoverWidget.background': colors.surfaceElevated,
      'editorHoverWidget.border': colors.border,
    },
  })

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowNonTsExtensions: true,
    strict: true,
    allowJs: true,
    baseUrl: 'file:///',
    paths: {
      '*': ['*', 'file:///*'],
    },
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  })

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module 'bun:test' {
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect(val: any): {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeNull(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toThrow(msg?: string | RegExp): void;
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
}`,
    'file:///node_modules/@types/bun-test/index.d.ts',
  )

  if (files) {
    for (const [filePath, content] of Object.entries(files)) {
      const uri = monaco.Uri.parse(`file:///${filePath}`)
      const existing = monaco.editor.getModel(uri)
      if (!existing) {
        const modelLang = filePath.endsWith('.ts')
          ? 'typescript'
          : filePath.endsWith('.py')
            ? 'python'
            : filePath.endsWith('.json')
              ? 'json'
              : 'typescript'
        monaco.editor.createModel(content, modelLang, uri)
      }
    }
  }
}

export const MonacoEditor = ({
  value,
  path,
  files,
  language = 'typescript',
  readOnly = false,
  onChange,
}: MonacoEditorProps) => {
  const isHeadless = typeof window === 'undefined' || !window.matchMedia
  const editorRef = useRef<EditorInstance | null>(null)
  const lastKnownValue = useRef<string>(value)

  useEffect(() => {
    if (editorRef.current && value !== lastKnownValue.current) {
      const model = editorRef.current.getModel()
      if (model && model.getValue() !== value) {
        lastKnownValue.current = value
        editorRef.current.setValue(value)
      }
    }
  }, [value])

  if (isHeadless) {
    return (
      <div className={editorContainerStyle}>
        <textarea
          className={fallbackTextareaStyle}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.currentTarget.value)}
          spellcheck={false}
        />
      </div>
    )
  }

  const handleBeforeMount: BeforeMount = (monaco) => {
    setupMonaco(monaco, files)
  }

  const handleOnMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    if (files) {
      for (const [filePath, content] of Object.entries(files)) {
        const uri = monaco.Uri.parse(`file:///${filePath}`)
        const existing = monaco.editor.getModel(uri)
        if (!existing) {
          const modelLang = filePath.endsWith('.ts')
            ? 'typescript'
            : filePath.endsWith('.py')
              ? 'python'
              : filePath.endsWith('.json')
                ? 'json'
                : 'typescript'
          monaco.editor.createModel(content, modelLang, uri)
        }
      }
    }
  }

  const handleChange = (val: string | undefined) => {
    const nextVal = val ?? ''
    lastKnownValue.current = nextVal
    onChange?.(nextVal)
  }

  return (
    <div className={editorContainerStyle}>
      <Editor
        height="100%"
        width="100%"
        {...(path ? { path: `file:///${path}` } : {})}
        language={language}
        defaultValue={value}
        saveViewState={true}
        keepCurrentModel={true}
        theme="zed-dark"
        beforeMount={handleBeforeMount}
        onMount={handleOnMount}
        onChange={handleChange}
        options={{
          readOnly,
          fontFamily: fonts.mono,
          fontSize: 15,
          lineHeight: 24,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          tabSize: 2,
          suggestOnTriggerCharacters: true,
          quickSuggestions: { other: true, comments: false, strings: true },
          parameterHints: { enabled: true },
          formatOnType: true,
          formatOnPaste: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          wordBasedSuggestions: 'matchingDocuments',
          hover: { enabled: 'on', delay: 200 },
          showUnused: true,
          renderValidationDecorations: 'on',
        }}
      />
    </div>
  )
}
