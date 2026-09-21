/** @jsxImportSource preact */
import { Play, Save } from 'lucide-preact'
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
import {
  actionsGroupStyle,
  editorContentStyle,
  editorPaneStyle,
  rightContentPaneStyle,
  rightPaneContainerStyle,
  studioRootStyle,
  studioWorkspaceStyle,
} from './challengeStudio.css'
import { type RightPanelTab, useChallengeStudio } from './hooks'

const RIGHT_PANEL_TABS: DockRailItem<RightPanelTab>[] = [
  { id: 'challenge', label: 'Challenge' },
  { id: 'config', label: 'Config' },
  { id: 'kuma', label: 'Kuma' },
]

export const ChallengeStudio = () => {
  const {
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
  } = useChallengeStudio()

  const starterFileList = Object.keys(challenge.metadata.starterFiles)
  const testFileList = Object.keys(challenge.metadata.testFiles)

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
              onClick={() => handleRunVerification()}
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
              onSelectTab={handleSelectFile}
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
