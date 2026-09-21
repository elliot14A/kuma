import type { AssessmentId, Challenge, ChallengeId, ExecutionResult, FileMap } from '@kuma/domain'
import { useState } from 'preact/hooks'
import { ApiClient, useAtomSet } from '#/lib'

export type RightPanelTab = 'challenge' | 'config' | 'kuma'

const defaultChallenge: Challenge = {
  id: 'ch_new' as ChallengeId,
  title: 'New Challenge',
  description: 'Challenge description and specifications.',
  language: 'typescript',
  timeLimitMinutes: 45,
  metadata: {
    specMarkdown:
      '# New Challenge\n\n## Overview\nDescribe the challenge requirements and constraints here.',
    starterFiles: {
      'src/solution.ts': 'export const solution = () => {\n  // Implement solution\n}\n',
    },
    testFiles: {
      'tests/solution.test.ts':
        "import { describe, expect, it } from 'bun:test'\nimport { solution } from '../src/solution'\n\ndescribe('solution', () => {\n  it('executes successfully', () => {\n    expect(solution).toBeDefined()\n  })\n})\n",
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const useChallengeStudio = (_initialChallengeId?: ChallengeId) => {
  const [challenge, setChallenge] = useState<Challenge>(defaultChallenge)
  const [difficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [tags] = useState<string[]>(['systems', 'algorithms'])
  const [specMarkdown, setSpecMarkdown] = useState(defaultChallenge.metadata.specMarkdown)
  const [openTabs, setOpenTabs] = useState<string[]>([
    'spec.md',
    'src/solution.ts',
    'tests/solution.test.ts',
  ])
  const [activeFile, setActiveFile] = useState<string>('src/solution.ts')
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set())
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle')
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>('challenge')

  const execute = useAtomSet(ApiClient.mutation('executions', 'execute'), { mode: 'promise' })
  const patchChallenge = useAtomSet(ApiClient.mutation('challenges', 'patch'), { mode: 'promise' })

  const handleSelectFile = (file: string) => {
    if (!openTabs.includes(file)) {
      setOpenTabs([...openTabs, file])
    }
    setActiveFile(file)
  }

  const handleCloseTab = (file: string) => {
    const nextTabs = openTabs.filter((t) => t !== file)
    setOpenTabs(nextTabs)
    if (activeFile === file && nextTabs.length > 0) {
      const lastTab = nextTabs[nextTabs.length - 1]
      if (lastTab) {
        setActiveFile(lastTab)
      }
    }
  }

  const handleCodeChange = (newCode: string) => {
    if (activeFile === 'spec.md') {
      setSpecMarkdown(newCode)
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          specMarkdown: newCode,
        },
      }))
    } else if (challenge.metadata.starterFiles[activeFile] !== undefined) {
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          starterFiles: { ...prev.metadata.starterFiles, [activeFile]: newCode },
        },
      }))
    } else if (challenge.metadata.testFiles[activeFile] !== undefined) {
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          testFiles: { ...prev.metadata.testFiles, [activeFile]: newCode },
        },
      }))
    }
    setDirtyFiles((prev) => new Set([...prev, activeFile]))
  }

  const handleApplyAgentCode = (file: string, newCode: string) => {
    if (file === 'spec.md') {
      setSpecMarkdown(newCode)
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          specMarkdown: newCode,
        },
      }))
    } else if (challenge.metadata.starterFiles[file] !== undefined) {
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          starterFiles: { ...prev.metadata.starterFiles, [file]: newCode },
        },
      }))
    } else if (challenge.metadata.testFiles[file] !== undefined) {
      setChallenge((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          testFiles: { ...prev.metadata.testFiles, [file]: newCode },
        },
      }))
    }
    setDirtyFiles((prev) => new Set([...prev, file]))
  }

  const handleRunVerification = async (assessmentId?: string) => {
    if (!assessmentId) return
    setTestStatus('running')
    setIsDrawerExpanded(true)

    try {
      const result = await execute({
        params: { id: assessmentId as AssessmentId },
        payload: {
          challengeId: challenge.id,
          candidateFiles: {
            ...challenge.metadata.starterFiles,
            ...challenge.metadata.testFiles,
          } as FileMap,
        },
      })
      setTestStatus(result.status === 'passed' ? 'passed' : 'failed')
      setExecutionResult(result)
    } catch {
      setTestStatus('failed')
    }
  }

  const handleSave = async () => {
    try {
      await patchChallenge({
        params: { id: challenge.id },
        payload: {
          title: challenge.title,
          description: challenge.description,
          language: challenge.language,
          timeLimitMinutes: challenge.timeLimitMinutes,
          metadata: challenge.metadata,
        },
      })
      setDirtyFiles(new Set())
    } catch {
      // ignore
    }
  }

  const getCurrentContent = () => {
    if (activeFile === 'spec.md') {
      return specMarkdown
    }
    if (challenge.metadata.starterFiles[activeFile] !== undefined) {
      return challenge.metadata.starterFiles[activeFile] ?? ''
    }
    if (challenge.metadata.testFiles[activeFile] !== undefined) {
      return challenge.metadata.testFiles[activeFile] ?? ''
    }
    return ''
  }

  return {
    challenge,
    difficulty,
    tags,
    specMarkdown,
    openTabs,
    activeFile,
    dirtyFiles,
    testStatus,
    executionResult,
    isDrawerExpanded,
    activeRightTab,
    setIsDrawerExpanded,
    setActiveRightTab,
    handleSelectFile,
    handleCloseTab,
    handleCodeChange,
    handleApplyAgentCode,
    handleRunVerification,
    handleSave,
    getCurrentContent,
  }
}
