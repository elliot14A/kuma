/** @jsxImportSource preact */
import {
  ArrowRight,
  ArrowUp,
  AtSign,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Copy,
  FileCode,
  HelpCircle,
  Paperclip,
  Plus,
  Terminal,
} from 'lucide-preact'
import { useState } from 'preact/hooks'
import { colors } from '#/styles/tokens'
import {
  agentMessageCard,
  applyBtnStyle,
  codeBlockContent,
  codeCardActions,
  codeCardContainer,
  codeCardHeader,
  composerBox,
  composerTextarea,
  composerToolbar,
  composerToolbarLeft,
  contextBarContainer,
  contextChip,
  headerLeftStyle,
  headerRightStyle,
  headerStyle,
  iconBtnStyle,
  messageFeedStyle,
  messageHeader,
  modelPillStyle,
  quickSuggestionsContainer,
  sendBtnStyle,
  suggestionChip,
  thinkingBox,
  userMessageCard,
} from './agentPanel.css'

export type AgentPanelMode = 'author' | 'candidate'

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  contextFiles?: string[] | undefined
  thoughts?: string[] | undefined
  codeSnippet?:
    | {
        file: string
        code: string
        language: string
      }
    | undefined
}

export interface AgentPanelProps {
  mode?: AgentPanelMode | undefined
  activeFile?: string | undefined
  contextFiles?: string[] | undefined
  onApplyCode?: ((file: string, code: string) => void) | undefined
}

const authorInitialMessages: AgentMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content:
      'Scaffold an in-memory KV store with TTL eviction and write Bun unit tests for passive expiration.',
    contextFiles: ['spec.md', 'src/kv_store.ts'],
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      'I have designed the `InMemoryKVStore` architecture conforming to the challenge specification. The store supports O(1) passive expiration upon `get()` and active batch purging with `cleanupExpired()`.',
    thoughts: [
      'Parsed challenge requirements from spec.md',
      'Configured StoreEntry interface with expiresAt timestamp in src/types.ts',
      'Implemented InMemoryKVStore with passive and active eviction loops',
    ],
    codeSnippet: {
      file: 'src/kv_store.ts',
      language: 'typescript',
      code: `import type { KVStore, StoreEntry } from './types'

export class InMemoryKVStore implements KVStore {
  private readonly store = new Map<string, StoreEntry>()

  set(key: string, value: unknown, ttlMs?: number): void {
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : undefined
    this.store.set(key, { value, expiresAt })
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (entry.expiresAt !== undefined && Date.now() >= entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }

  cleanupExpired(): number {
    const now = Date.now()
    let evicted = 0

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== undefined && now >= entry.expiresAt) {
        this.store.delete(key)
        evicted++
      }
    }

    return evicted
  }
}`,
    },
  },
]

const candidateInitialMessages: AgentMessage[] = [
  {
    id: 'cand-msg-1',
    role: 'assistant',
    content:
      'Welcome to the technical assessment! I am Kuma, your pair programming assistant. You can ask me for conceptual guidance, syntax clarifications, or assistance debugging test failures without leaking hidden solutions.',
    thoughts: [
      'Assessment mode initialized',
      'Attached active challenge constraints and public test cases',
      'Evaluation guardrails active',
    ],
  },
]

export const AgentPanel = ({
  mode = 'author',
  activeFile = 'src/kv_store.ts',
  contextFiles = ['spec.md', 'src/kv_store.ts', 'src/types.ts'],
  onApplyCode,
}: AgentPanelProps) => {
  const isAuthor = mode === 'author'
  const [messages, setMessages] = useState<AgentMessage[]>(
    isAuthor ? authorInitialMessages : candidateInitialMessages,
  )
  const [inputPrompt, setInputPrompt] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState(
    isAuthor ? 'claude-3-7-sonnet' : 'kuma-nebius-v1',
  )

  const handleCopyCode = (id: string, code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleApply = (id: string, file: string, code: string) => {
    onApplyCode?.(file, code)
    setAppliedId(id)
    setTimeout(() => setAppliedId(null), 2000)
  }

  const handleSend = () => {
    if (!inputPrompt.trim()) {
      return
    }

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputPrompt.trim(),
      contextFiles: [activeFile],
    }

    const assistantMsg: AgentMessage = {
      id: `agent-${Date.now() + 1}`,
      role: 'assistant',
      content: isAuthor
        ? `I've updated the implementation based on your prompt: "${inputPrompt.trim()}". All constraints and type signatures are verified.`
        : `Here is a targeted hint regarding "${inputPrompt.trim()}": Verify your expiration check order before accessing stored map keys.`,
      thoughts: [
        `Analyzed prompt against current active buffer (${activeFile})`,
        isAuthor
          ? 'Checked TypeScript types and interface contracts'
          : 'Enforced candidate Socratic mentoring guardrails',
      ],
      codeSnippet: isAuthor
        ? {
            file: activeFile,
            language: activeFile.endsWith('.py') ? 'python' : 'typescript',
            code: `// Updated code for ${activeFile}\n// Generated by Kuma\n`,
          }
        : undefined,
    }

    setMessages([...messages, userMsg, assistantMsg])
    setInputPrompt('')
  }

  const handleSuggestionClick = (promptText: string) => {
    setInputPrompt(promptText)
  }

  const handleClear = () => {
    setMessages([])
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div className={headerStyle}>
        <div className={headerLeftStyle}>
          <Command size={13} color={colors.accent} />
          <span>Kuma</span>
        </div>

        <div className={headerRightStyle}>
          <button
            type="button"
            className={modelPillStyle}
            onClick={() =>
              setSelectedModel(
                selectedModel === 'claude-3-7-sonnet' ? 'kuma-nebius-v1' : 'claude-3-7-sonnet',
              )
            }
          >
            <span>{selectedModel}</span>
            <ChevronDown size={10} />
          </button>
          <button
            type="button"
            className={iconBtnStyle}
            onClick={handleClear}
            title="New Chat Session"
            aria-label="New Chat Session"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className={contextBarContainer}>
        {contextFiles.map((f) => (
          <span key={f} className={contextChip}>
            <AtSign size={10} />
            <span>{f}</span>
          </span>
        ))}
      </div>

      <div className={messageFeedStyle}>
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className={userMessageCard}>
                <div className={messageHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronRight size={12} color={colors.textSecondary} />
                    <span>You</span>
                  </div>
                  {msg.contextFiles ? <span>{msg.contextFiles.join(', ')}</span> : null}
                </div>
                <div>{msg.content}</div>
              </div>
            )
          }

          return (
            <div key={msg.id} className={agentMessageCard}>
              <div className={messageHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Command size={12} color={colors.accent} />
                  <span>Kuma</span>
                </div>
              </div>

              {msg.thoughts && msg.thoughts.length > 0 ? (
                <div className={thinkingBox}>
                  {msg.thoughts.map((t) => (
                    <div key={t}>• {t}</div>
                  ))}
                </div>
              ) : null}

              <div>{msg.content}</div>

              {msg.codeSnippet
                ? (() => {
                    const snippet = msg.codeSnippet
                    return (
                      <div className={codeCardContainer}>
                        <div className={codeCardHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileCode size={12} color={colors.info} />
                            <span>{snippet.file}</span>
                          </div>

                          <div className={codeCardActions}>
                            <button
                              type="button"
                              className={applyBtnStyle}
                              onClick={() => handleApply(msg.id, snippet.file, snippet.code)}
                            >
                              {appliedId === msg.id ? (
                                <Check size={11} />
                              ) : (
                                <ArrowRight size={11} />
                              )}
                              <span>{appliedId === msg.id ? 'Applied' : 'Apply'}</span>
                            </button>
                            <button
                              type="button"
                              className={iconBtnStyle}
                              onClick={() => handleCopyCode(msg.id, snippet.code)}
                              title="Copy Code"
                              aria-label="Copy Code"
                            >
                              {copiedId === msg.id ? (
                                <Check size={12} color={colors.success} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </div>
                        <pre className={codeBlockContent}>{snippet.code}</pre>
                      </div>
                    )
                  })()
                : null}
            </div>
          )
        })}
      </div>

      <div className={quickSuggestionsContainer}>
        {isAuthor ? (
          <>
            <button
              type="button"
              className={suggestionChip}
              onClick={() => handleSuggestionClick('Scaffold in-memory KV store with TTL')}
            >
              <Code2 size={10} color={colors.accent} />
              <span>/scaffold-kv</span>
            </button>
            <button
              type="button"
              className={suggestionChip}
              onClick={() =>
                handleSuggestionClick('Generate Bun test suites for passive expiration')
              }
            >
              <Terminal size={10} color={colors.success} />
              <span>/write-tests</span>
            </button>
            <button
              type="button"
              className={suggestionChip}
              onClick={() => handleSuggestionClick('Explain TTL expiration complexity')}
            >
              <HelpCircle size={10} color={colors.info} />
              <span>/explain</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={suggestionChip}
              onClick={() => handleSuggestionClick('Give me a hint on TTL passive expiration')}
            >
              <HelpCircle size={10} color={colors.accent} />
              <span>/ask-hint</span>
            </button>
            <button
              type="button"
              className={suggestionChip}
              onClick={() => handleSuggestionClick('Explain why get(key) returns undefined')}
            >
              <Terminal size={10} color={colors.warning} />
              <span>/debug-error</span>
            </button>
            <button
              type="button"
              className={suggestionChip}
              onClick={() => handleSuggestionClick('Check time complexity of cleanupExpired()')}
            >
              <Code2 size={10} color={colors.info} />
              <span>/check-complexity</span>
            </button>
          </>
        )}
      </div>

      <div className={composerBox}>
        <textarea
          className={composerTextarea}
          placeholder="Ask Kuma to scaffold, refactor, or explain code..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />

        <div className={composerToolbar}>
          <div className={composerToolbarLeft}>
            <button
              type="button"
              className={iconBtnStyle}
              title="Attach Active File Context"
              aria-label="Attach Active File Context"
            >
              <Paperclip size={13} />
            </button>
            <button
              type="button"
              className={iconBtnStyle}
              title="Slash Commands"
              aria-label="Slash Commands"
            >
              <Terminal size={13} />
            </button>
          </div>

          <button
            type="button"
            className={sendBtnStyle}
            disabled={!inputPrompt.trim()}
            onClick={handleSend}
            title="Send Prompt (Enter)"
            aria-label="Send Prompt"
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
