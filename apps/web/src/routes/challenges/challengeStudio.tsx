/** @jsxImportSource preact */
import type { ExecutionResult } from '@kuma/domain'
import { Effect } from 'effect'
import { Play, Save } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import {
  AgentPanel,
  AppHeader,
  Button,
  DockRail,
  type DockRailItem,
  FileTree,
  Inspector,
  MarkdownViewer,
  MonacoEditor,
  Sidebar,
  SplitPane,
  TabHeader,
  TestDrawer,
} from '#/components'
import { mockExecutionResult, mockKvStoreChallenge, mockSpecMarkdown } from '#/mocks'
import { loadStudioChallenge, saveChallengeDraft, verifyChallengeSolution } from '#/services'
import {
  actionsGroupStyle,
  editorContentStyle,
  editorPaneStyle,
  rightContentPaneStyle,
  rightPaneContainerStyle,
  studioRootStyle,
  studioWorkspaceStyle,
} from './challengeStudio.css'

export type RightPanelTab = 'challenge' | 'config' | 'kuma'

const RIGHT_PANEL_TABS: DockRailItem<RightPanelTab>[] = [
  { id: 'challenge', label: 'Challenge' },
  { id: 'config', label: 'Config' },
  { id: 'kuma', label: 'Kuma' },
]

export const ChallengeStudio = () => {
  const [challenge, setChallenge] = useState(mockKvStoreChallenge)
  const [difficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [tags] = useState<string[]>(['systems', 'ttl', 'cache', 'data-structures'])
  const [specMarkdown, setSpecMarkdown] = useState(mockSpecMarkdown)
  const [openTabs, setOpenTabs] = useState<string[]>([
    'spec.md',
    'src/kv_store.ts',
    'src/types.ts',
    'tests/kv_store.test.ts',
  ])
  const [activeFile, setActiveFile] = useState<string>('src/kv_store.ts')
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set())

  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('passed')
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(
    mockExecutionResult,
  )
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true)
  const [activeRightTab, setActiveRightTab] = useState<RightPanelTab>('challenge')

  useEffect(() => {
    Effect.runPromise(loadStudioChallenge()).then((loaded) => {
      setChallenge(loaded)
      setSpecMarkdown(loaded.metadata.specMarkdown)
      const starters = Object.keys(loaded.metadata.starterFiles)
      const tests = Object.keys(loaded.metadata.testFiles)
      setOpenTabs(['spec.md', ...starters, ...tests])
      if (starters.length > 0 && starters[0]) {
        setActiveFile(starters[0])
      }
    })
  }, [])

  const starterFileList = Object.keys(challenge.metadata.starterFiles)
  const testFileList = Object.keys(challenge.metadata.testFiles)

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
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          specMarkdown: newCode,
        },
      })
    } else if (challenge.metadata.starterFiles[activeFile] !== undefined) {
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          starterFiles: { ...challenge.metadata.starterFiles, [activeFile]: newCode },
        },
      })
    } else if (challenge.metadata.testFiles[activeFile] !== undefined) {
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          testFiles: { ...challenge.metadata.testFiles, [activeFile]: newCode },
        },
      })
    }

    setDirtyFiles(new Set([...dirtyFiles, activeFile]))
  }

  const handleApplyAgentCode = (file: string, newCode: string) => {
    if (file === 'spec.md') {
      setSpecMarkdown(newCode)
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          specMarkdown: newCode,
        },
      })
    } else if (challenge.metadata.starterFiles[file] !== undefined) {
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          starterFiles: { ...challenge.metadata.starterFiles, [file]: newCode },
        },
      })
    } else if (challenge.metadata.testFiles[file] !== undefined) {
      setChallenge({
        ...challenge,
        metadata: {
          ...challenge.metadata,
          testFiles: { ...challenge.metadata.testFiles, [file]: newCode },
        },
      })
    }
    setDirtyFiles(new Set([...dirtyFiles, file]))
  }

  const handleRunVerification = () => {
    setTestStatus('running')
    setIsDrawerExpanded(true)

    const program = Effect.gen(function* () {
      const result = yield* verifyChallengeSolution(challenge.id, {
        ...challenge.metadata.starterFiles,
        ...challenge.metadata.testFiles,
      })
      return result
    })

    Effect.runPromise(program)
      .then((result) => {
        setTestStatus('passed')
        setExecutionResult(result)
      })
      .catch(() => {
        setTestStatus('failed')
      })
  }

  const handleSave = () => {
    const program = Effect.gen(function* () {
      yield* saveChallengeDraft(challenge)
    })

    Effect.runPromise(program).then(() => {
      setDirtyFiles(new Set())
    })
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

  return (
    <div className={studioRootStyle}>
      <AppHeader
        logoText="kuma"
        breadcrumbs={[
          { label: 'challenges', href: '/challenges' },
          { label: challenge.id.replace('ch_', ''), active: true },
        ]}
        statusType={dirtyFiles.size > 0 ? 'warning' : 'idle'}
        statusText={dirtyFiles.size > 0 ? 'Draft (Unsaved)' : 'Saved'}
        actionsSlot={
          <div className={actionsGroupStyle}>
            <Button
              variant="primary"
              size="md"
              icon={<Play size={12} fill="currentColor" />}
              onClick={handleRunVerification}
              disabled={testStatus === 'running'}
            >
              {testStatus === 'running' ? 'Verifying...' : 'Verify Solution'}
            </Button>
            <Button variant="secondary" size="md" icon={<Save size={12} />} onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      />

      <div className={studioWorkspaceStyle}>
        <Sidebar activeId="challenges" />

        <SplitPane direction="horizontal" initialSizes={[18, 54, 28]} minSizes={[12, 35, 20]}>
          <FileTree
            specFile="spec.md"
            starterFiles={starterFileList}
            testFiles={testFileList}
            activeFile={activeFile}
            workspaceName={challenge.title}
            onSelectFile={handleSelectFile}
          />

          <div className={editorPaneStyle}>
            <TabHeader
              openFiles={openTabs}
              activeFile={activeFile}
              dirtyFiles={dirtyFiles}
              onSelectTab={setActiveFile}
              onCloseTab={handleCloseTab}
            />

            <div className={editorContentStyle}>
              {activeFile === 'spec.md' ? (
                <MarkdownViewer content={getCurrentContent()} />
              ) : (
                <MonacoEditor
                  value={getCurrentContent()}
                  path={activeFile}
                  files={{
                    ...challenge.metadata.starterFiles,
                    ...challenge.metadata.testFiles,
                  }}
                  language={challenge.language}
                  onChange={handleCodeChange}
                />
              )}
            </div>

            <TestDrawer
              status={testStatus}
              result={executionResult}
              isExpanded={isDrawerExpanded}
              onToggleExpand={() => setIsDrawerExpanded(!isDrawerExpanded)}
            />
          </div>

          <div className={rightPaneContainerStyle}>
            <div className={rightContentPaneStyle}>
              {activeRightTab === 'challenge' && <MarkdownViewer content={specMarkdown} />}
              {activeRightTab === 'config' && (
                <Inspector challenge={challenge} difficulty={difficulty} tags={tags} />
              )}
              {activeRightTab === 'kuma' && (
                <AgentPanel
                  mode="author"
                  activeFile={activeFile}
                  contextFiles={['spec.md', ...starterFileList, ...testFileList]}
                  onApplyCode={handleApplyAgentCode}
                />
              )}
            </div>

            <DockRail
              items={RIGHT_PANEL_TABS}
              activeId={activeRightTab}
              onSelect={setActiveRightTab}
            />
          </div>
        </SplitPane>
      </div>
    </div>
  )
}
